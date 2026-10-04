import pickle
import json
from pathlib import Path

import ollama
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# CHEMIN DU DOSSIER
# ============================================================

BASE_DIR = Path(__file__).resolve().parent


# ============================================================
# 1. CHARGEMENT DES EMBEDDINGS
# ============================================================

print("==============================================")
print("       CHARGEMENT DU SYSTEME IA")
print("==============================================")

print("\nChargement des embeddings...")

embeddings_path = BASE_DIR / "embeddings.pkl"

try:

    with open(embeddings_path, "rb") as f:
        data = pickle.load(f)

    chunks = data["chunks"]
    embeddings = data["embeddings"]

    print("Embeddings chargés.")
    print(f"Nombre de chunks : {len(chunks)}")

except FileNotFoundError:

    raise RuntimeError(
        f"Fichier embeddings.pkl introuvable : {embeddings_path}"
    )

except Exception as e:

    raise RuntimeError(
        f"Erreur lors du chargement des embeddings : {e}"
    )


# ============================================================
# 2. CHARGEMENT DU MODELE D'EMBEDDING
# ============================================================

print("\nChargement du modèle d'embedding...")

try:

    model = SentenceTransformer(
        "all-MiniLM-L6-v2"
    )

    print("Modèle chargé.")

except Exception as e:

    raise RuntimeError(
        f"Erreur lors du chargement du modèle : {e}"
    )


# ============================================================
# 3. NETTOYAGE JSON
# ============================================================

def nettoyer_json(result):

    if not result:

        raise ValueError(
            "Ollama a retourné une réponse vide."
        )

    result = result.strip()

    # Retirer Markdown si Ollama en ajoute malgré tout
    if result.startswith("```json"):

        result = result[len("```json"):]

    elif result.startswith("```"):

        result = result[len("```"):]

    if result.endswith("```"):

        result = result[:-3]

    return result.strip()


# ============================================================
# 4. VERIFICATION D'UNE QUESTION
# ============================================================

def verifier_question(exercise, index):

    # --------------------------------------------------------
    # Objet JSON
    # --------------------------------------------------------

    if not isinstance(exercise, dict):

        raise ValueError(
            f"La question {index} doit être un objet JSON."
        )

    # --------------------------------------------------------
    # Question
    # --------------------------------------------------------

    if "question" not in exercise:

        raise ValueError(
            f"La question {index} ne contient pas 'question'."
        )

    if not exercise["question"]:

        raise ValueError(
            f"La question {index} est vide."
        )

    # --------------------------------------------------------
    # Choices
    # --------------------------------------------------------

    if "choices" not in exercise:

        raise ValueError(
            f"La question {index} ne contient pas 'choices'."
        )

    choices = exercise["choices"]

    if not isinstance(choices, dict):

        raise ValueError(
            f"Les choix de la question {index} "
            f"doivent être un objet JSON."
        )

    required_choices = ["A", "B", "C", "D"]

    for choice in required_choices:

        if choice not in choices:

            raise ValueError(
                f"Le choix {choice} manque "
                f"dans la question {index}."
            )

    if len(choices) != 4:

        raise ValueError(
            f"La question {index} doit avoir exactement 4 choix."
        )

    # --------------------------------------------------------
    # Bonne réponse
    # --------------------------------------------------------

    if "correct_answer" not in exercise:

        raise ValueError(
            f"La question {index} ne contient pas "
            f"'correct_answer'."
        )

    correct_answer = str(
        exercise["correct_answer"]
    ).strip().upper()

    if correct_answer not in required_choices:

        raise ValueError(
            f"La bonne réponse de la question {index} "
            f"doit être A, B, C ou D."
        )

    exercise["correct_answer"] = correct_answer

    # --------------------------------------------------------
    # Explication
    # --------------------------------------------------------

    if "explanation" not in exercise:

        raise ValueError(
            f"La question {index} ne contient pas "
            f"'explanation'."
        )

    if not exercise["explanation"]:

        raise ValueError(
            f"L'explication de la question {index} est vide."
        )


# ============================================================
# 5. GENERATION DES EXERCICES
# ============================================================

def generate_exercises(course, number_questions=3):

    # --------------------------------------------------------
    # Vérification du thème
    # --------------------------------------------------------

    if not course or not course.strip():

        raise ValueError(
            "Le cours ou thème ne peut pas être vide."
        )

    course = course.strip()

    print("\n==============================================")
    print("       RECHERCHE DU CONTEXTE")
    print("==============================================")

    print(f"\nThème demandé : {course}")


    # ========================================================
    # EMBEDDING DU THEME
    # ========================================================

    question_embedding = model.encode(
        [course]
    )


    # ========================================================
    # CALCUL DE SIMILARITE
    # ========================================================

    scores = cosine_similarity(
        question_embedding,
        embeddings
    )[0]


    # ========================================================
    # SELECTION DES CHUNKS
    # ========================================================

    top_indices = scores.argsort()[-5:][::-1]

    context = ""

    for i in top_indices:

        context += chunks[i]
        context += "\n\n"


    # ========================================================
    # PROMPT
    # ========================================================

    prompt = f"""
Tu es un assistant pédagogique pour une plateforme de formation.

Ta mission est de générer un QCM à partir UNIQUEMENT du contexte
du cours fourni.

THEME :
{course}

CONTEXTE DU COURS :
{context}

============================================================
REGLES OBLIGATOIRES
============================================================

1. Tu dois générer EXACTEMENT {number_questions} questions.

2. Il doit obligatoirement y avoir {number_questions} objets
   dans le tableau "questions".

3. Chaque question doit avoir exactement 4 choix :
   A, B, C et D.

4. Une seule réponse doit être correcte.

5. "correct_answer" doit contenir uniquement :
   "A", "B", "C" ou "D".

6. Chaque question doit avoir une explication.

7. Les questions doivent être basées uniquement sur le contexte.

8. N'invente aucune information qui n'est pas présente dans
   le contexte.

9. Les questions doivent être différentes les unes des autres.

10. Retourne UNIQUEMENT du JSON.

11. Aucun texte avant le JSON.

12. Aucun texte après le JSON.

13. Aucun Markdown.

============================================================
FORMAT JSON OBLIGATOIRE
============================================================

{{
    "questions": [
        {{
            "question": "Question 1",
            "choices": {{
                "A": "Réponse A",
                "B": "Réponse B",
                "C": "Réponse C",
                "D": "Réponse D"
            }},
            "correct_answer": "A",
            "explanation": "Explication de la réponse."
        }},
        {{
            "question": "Question 2",
            "choices": {{
                "A": "Réponse A",
                "B": "Réponse B",
                "C": "Réponse C",
                "D": "Réponse D"
            }},
            "correct_answer": "B",
            "explanation": "Explication de la réponse."
        }},
        {{
            "question": "Question 3",
            "choices": {{
                "A": "Réponse A",
                "B": "Réponse B",
                "C": "Réponse C",
                "D": "Réponse D"
            }},
            "correct_answer": "C",
            "explanation": "Explication de la réponse."
        }}
    ]
}}

IMPORTANT :

Le tableau "questions" doit contenir exactement
{number_questions} questions.
"""


    # ========================================================
    # APPEL OLLAMA
    # ========================================================

    print("\n==============================================")
    print("       GENERATION AVEC OLLAMA")
    print("==============================================")

    try:

        response = ollama.chat(

            model="llama3.2",

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            format="json",

            options={
                "temperature": 0.1,
                "num_predict": 3000
            }
        )

    except Exception as e:

        raise RuntimeError(
            f"Erreur Ollama : {e}"
        )


    # ========================================================
    # RECUPERATION DE LA REPONSE
    # ========================================================

    try:

        result = response["message"]["content"]

    except Exception:

        raise RuntimeError(
            "Réponse Ollama inattendue."
        )


    result = nettoyer_json(result)

    print("\nRéponse Ollama reçue.")

    print("\nRéponse brute :")
    print(result)


    # ========================================================
    # CONVERSION JSON
    # ========================================================

    try:

        data = json.loads(result)

    except json.JSONDecodeError as e:

        print("\n==============================================")
        print("ERREUR JSON")
        print("==============================================")

        print(result)

        raise ValueError(
            f"La réponse Ollama n'est pas un JSON valide : {e}"
        )


    # ========================================================
    # RECUPERATION DES QUESTIONS
    # ========================================================

    if isinstance(data, dict):

        if "questions" in data:

            exercises = data["questions"]

        elif "question" in data:

            # Sécurité si Ollama renvoie une seule question
            exercises = [data]

        else:

            raise ValueError(
                "Format JSON retourné par Ollama non reconnu."
            )

    elif isinstance(data, list):

        exercises = data

    else:

        raise ValueError(
            "La réponse de l'IA doit être une liste "
            "ou un objet contenant 'questions'."
        )


    # ========================================================
    # VERIFICATION LISTE
    # ========================================================

    if not isinstance(exercises, list):

        raise ValueError(
            "Le champ 'questions' doit être une liste."
        )


    # ========================================================
    # VERIFICATION DU NOMBRE
    # ========================================================

    print("\n==============================================")
    print("       VERIFICATION DES QUESTIONS")
    print("==============================================")

    print(
        f"Questions demandées : {number_questions}"
    )

    print(
        f"Questions reçues : {len(exercises)}"
    )


    if len(exercises) != number_questions:

        raise ValueError(
            f"L'IA a généré {len(exercises)} questions "
            f"au lieu de {number_questions}."
        )


    # ========================================================
    # VERIFICATION DE CHAQUE QUESTION
    # ========================================================

    for index, exercise in enumerate(
        exercises,
        start=1
    ):

        verifier_question(
            exercise,
            index
        )


    # ========================================================
    # AFFICHAGE
    # ========================================================

    print("\n==============================================")
    print("       GENERATION TERMINEE")
    print("==============================================")

    print(
        f"Nombre de questions : {len(exercises)}"
    )


    for index, exercise in enumerate(
        exercises,
        start=1
    ):

        print(f"\nQuestion {index} :")
        print(exercise["question"])

        print("Choix :")

        for letter, answer in exercise["choices"].items():

            print(
                f"{letter} : {answer}"
            )

        print(
            f"Bonne réponse : "
            f"{exercise['correct_answer']}"
        )

        print(
            f"Explication : "
            f"{exercise['explanation']}"
        )


    # ========================================================
    # RETOUR VERS FASTAPI
    # ========================================================

    return exercises


# ============================================================
# IMPORTANT
#
# PAS DE input() ICI
# PAS DE TEST AUTOMATIQUE ICI
#
# FastAPI importe :
#
# from exercise_ai import generate_exercises
#
# ============================================================