import os
import json
import ollama

from pypdf import PdfReader


# ============================================================
# DOSSIER CONTENANT LES PDF
# ============================================================

DOCS_FOLDER = r"C:\Users\hp\Desktop\react_proj\plateformes\src\Doss_AI\Docs"


# ============================================================
# LIRE TOUS LES PDF
# ============================================================

def lire_tous_les_pdf():

    print("\n==============================================")
    print("       LECTURE DES DOCUMENTS")
    print("==============================================")

    # Vérifier le dossier
    if not os.path.exists(DOCS_FOLDER):

        raise FileNotFoundError(
            f"Le dossier des documents n'existe pas : {DOCS_FOLDER}"
        )

    # Récupérer tous les PDF
    fichiers_pdf = [
        fichier
        for fichier in os.listdir(DOCS_FOLDER)
        if fichier.lower().endswith(".pdf")
    ]

    # Aucun PDF
    if not fichiers_pdf:

        raise ValueError(
            "Aucun fichier PDF trouvé dans le dossier Docs."
        )

    print(
        f"Nombre de PDF trouvés : {len(fichiers_pdf)}"
    )

    contenus = []

    # Lire chaque PDF
    for nom_fichier in sorted(fichiers_pdf):

        chemin_pdf = os.path.join(
            DOCS_FOLDER,
            nom_fichier
        )

        print(
            f"\nLecture : {nom_fichier}"
        )

        try:

            reader = PdfReader(chemin_pdf)

            texte_pdf = []

            # Lire toutes les pages
            for page in reader.pages:

                texte = page.extract_text()

                if texte:

                    texte_pdf.append(texte)

            # Fusionner le texte
            contenu = "\n".join(
                texte_pdf
            ).strip()

            if contenu:

                contenus.append(
                    f"""
===== DOCUMENT : {nom_fichier} =====

{contenu}
"""
                )

                print(
                    f"  → Pages : {len(reader.pages)}"
                )

                print(
                    f"  → Caractères : {len(contenu)}"
                )

            else:

                print(
                    "  → Aucun texte exploitable."
                )

        except Exception as e:

            print(
                f"  → Erreur lecture PDF : {e}"
            )

    # Vérifier le contenu
    if not contenus:

        raise ValueError(
            "Les PDF trouvés ne contiennent aucun texte exploitable."
        )

    # Fusionner tous les PDF
    contenu_total = "\n".join(
        contenus
    )

    print("\n==============================================")
    print("       LECTURE TERMINEE")
    print("==============================================")

    print(
        f"Nombre total de caractères : "
        f"{len(contenu_total)}"
    )

    return contenu_total


# ============================================================
# GENERATION D'UN NIVEAU D'EXAMEN
# ============================================================

def generer_niveau_examen(
    niveau,
    nombre_questions=5
):

    # ========================================================
    # VERIFICATION DU NIVEAU
    # ========================================================

    niveaux_autorises = [
        "facile",
        "moyen",
        "difficile"
    ]

    if niveau not in niveaux_autorises:

        raise ValueError(
            "Le niveau doit être : "
            "facile, moyen ou difficile."
        )

    # ========================================================
    # LIRE TOUS LES PDF
    # ========================================================

    contenu_documents = lire_tous_les_pdf()

    # ========================================================
    # PROMPT
    # ========================================================

    prompt = f"""
Tu es un professeur qui prépare un examen pour une plateforme
de formation.

============================================================
SOURCE DES QUESTIONS
============================================================

Le contenu ci-dessous provient de TOUS les documents PDF
présents dans le dossier de la plateforme.

Tu dois utiliser UNIQUEMENT les informations présentes dans
ces documents.

N'utilise aucune connaissance extérieure.

============================================================
CONTENU DES DOCUMENTS
============================================================

{contenu_documents}

============================================================
NIVEAU
============================================================

{niveau}

============================================================
MISSION
============================================================

Génère exactement {nombre_questions} questions QCM.

============================================================
REGLES OBLIGATOIRES
============================================================

1. Génère exactement 5 questions.

2. Les 5 questions doivent être différentes.

3. Chaque question possède exactement 4 choix.

4. Les choix sont obligatoirement :
   A
   B
   C
   D

5. Une seule réponse est correcte.

6. correct_answer doit être uniquement :
   A, B, C ou D.

7. Chaque question doit avoir une explication.

8. Toutes les questions doivent être basées uniquement
   sur les documents PDF.

9. Ne crée aucune information absente des documents.

10. Les questions doivent correspondre au niveau demandé.

============================================================
NIVEAU FACILE
============================================================

Pour facile :

- définitions
- notions fondamentales
- compréhension simple
- informations directement présentes dans les documents

============================================================
NIVEAU MOYEN
============================================================

Pour moyen :

- compréhension approfondie
- application des notions
- comparaison
- raisonnement simple

============================================================
NIVEAU DIFFICILE
============================================================

Pour difficile :

- analyse
- raisonnement
- application complexe
- combinaison de plusieurs notions
- réflexion approfondie

============================================================
FORMAT DE REPONSE
============================================================

Retourne UNIQUEMENT du JSON.

Utilise exactement cette structure :

{{
    "question1": {{
        "question": "Question 1",
        "choices": {{
            "A": "Réponse A",
            "B": "Réponse B",
            "C": "Réponse C",
            "D": "Réponse D"
        }},
        "correct_answer": "A",
        "explanation": "Explication de la réponse"
    }},

    "question2": {{
        "question": "Question 2",
        "choices": {{
            "A": "Réponse A",
            "B": "Réponse B",
            "C": "Réponse C",
            "D": "Réponse D"
        }},
        "correct_answer": "B",
        "explanation": "Explication de la réponse"
    }},

    "question3": {{
        "question": "Question 3",
        "choices": {{
            "A": "Réponse A",
            "B": "Réponse B",
            "C": "Réponse C",
            "D": "Réponse D"
        }},
        "correct_answer": "C",
        "explanation": "Explication de la réponse"
    }},

    "question4": {{
        "question": "Question 4",
        "choices": {{
            "A": "Réponse A",
            "B": "Réponse B",
            "C": "Réponse C",
            "D": "Réponse D"
        }},
        "correct_answer": "D",
        "explanation": "Explication de la réponse"
    }},

    "question5": {{
        "question": "Question 5",
        "choices": {{
            "A": "Réponse A",
            "B": "Réponse B",
            "C": "Réponse C",
            "D": "Réponse D"
        }},
        "correct_answer": "A",
        "explanation": "Explication de la réponse"
    }}
}}

IMPORTANT :

- Il doit toujours y avoir exactement 5 questions.
- Les clés doivent être question1, question2, question3,
  question4 et question5.
- Chaque question doit contenir question, choices,
  correct_answer et explanation.
- Ne retourne aucun texte en dehors du JSON.
- N'utilise aucune connaissance extérieure aux PDF.
"""

    # ========================================================
    # APPEL OLLAMA
    # ========================================================

    print("\n==============================================")
    print("       GENERATION EXAMEN")
    print("==============================================")

    print(
        f"Niveau : {niveau}"
    )

    print(
        f"Questions demandées : {nombre_questions}"
    )

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
                "num_predict": 5000
            }
        )

    except Exception as e:

        raise RuntimeError(
            f"Erreur Ollama : {e}"
        )

    # ========================================================
    # RECUPERER LA REPONSE
    # ========================================================

    try:

        result = response["message"]["content"]

    except Exception:

        raise RuntimeError(
            "Réponse Ollama inattendue."
        )

    if not result:

        raise ValueError(
            "Ollama a retourné une réponse vide."
        )

    result = result.strip()

    # ========================================================
    # AFFICHER REPONSE BRUTE
    # ========================================================

    print("\n==============================================")
    print("       REPONSE BRUTE OLLAMA")
    print("==============================================")

    print(result)

    print("==============================================")

    # ========================================================
    # CONVERSION JSON
    # ========================================================

    try:

        questions = json.loads(result)

    except json.JSONDecodeError as e:

        print("\nERREUR JSON")
        print(result)

        raise ValueError(
            f"Réponse JSON invalide : {e}"
        )

    # ========================================================
    # NORMALISATION
    # ========================================================

    if isinstance(questions, dict):

        # ----------------------------------------------------
        # CAS 1 :
        # {
        #     "questions": [...]
        # }
        # ----------------------------------------------------

        if "questions" in questions:

            questions = questions["questions"]

        # ----------------------------------------------------
        # CAS 2 :
        # {
        #     "question": "...",
        #     "choices": {...}
        # }
        # ----------------------------------------------------

        elif "question" in questions:

            questions = [
                questions
            ]

        # ----------------------------------------------------
        # CAS 3 :
        # {
        #     "question1": {...},
        #     "question2": {...},
        #     "question3": {...},
        #     "question4": {...},
        #     "question5": {...}
        # }
        # ----------------------------------------------------

        else:

            questions_dict = questions

            questions = []

            # Récupérer uniquement question1 à question5
            for i in range(1, nombre_questions + 1):

                cle = f"question{i}"

                if cle in questions_dict:

                    questions.append(
                        questions_dict[cle]
                    )

            # Vérifier qu'on a trouvé des questions
            if not questions:

                raise ValueError(
                    "Format JSON retourné par Ollama non reconnu."
                )

    # ========================================================
    # VERIFICATION LISTE
    # ========================================================

    if not isinstance(questions, list):

        raise ValueError(
            "Les questions doivent être retournées "
            "sous forme de liste."
        )

    # ========================================================
    # VERIFICATION NOMBRE
    # ========================================================

    if len(questions) != nombre_questions:

        raise ValueError(
            f"L'IA a généré {len(questions)} questions "
            f"au lieu de {nombre_questions}."
        )

    # ========================================================
    # VERIFICATION DES QUESTIONS
    # ========================================================

    for index, question in enumerate(
        questions,
        start=1
    ):

        # ----------------------------------------------------
        # Vérifier objet
        # ----------------------------------------------------

        if not isinstance(question, dict):

            raise ValueError(
                f"La question {index} doit être "
                f"un objet JSON."
            )

        # ----------------------------------------------------
        # Vérifier question
        # ----------------------------------------------------

        if "question" not in question:

            raise ValueError(
                f"La question {index} "
                f"ne contient pas 'question'."
            )

        if not str(
            question["question"]
        ).strip():

            raise ValueError(
                f"La question {index} est vide."
            )

        # ----------------------------------------------------
        # Vérifier choices
        # ----------------------------------------------------

        if "choices" not in question:

            raise ValueError(
                f"La question {index} "
                f"ne contient pas 'choices'."
            )

        choices = question["choices"]

        if not isinstance(choices, dict):

            raise ValueError(
                f"Les choix de la question {index} "
                f"doivent être un objet."
            )

        # ----------------------------------------------------
        # Vérifier A B C D
        # ----------------------------------------------------

        for lettre in [
            "A",
            "B",
            "C",
            "D"
        ]:

            if lettre not in choices:

                raise ValueError(
                    f"Le choix {lettre} manque "
                    f"dans la question {index}."
                )

            if not str(
                choices[lettre]
            ).strip():

                raise ValueError(
                    f"Le choix {lettre} de la question "
                    f"{index} est vide."
                )

        # ----------------------------------------------------
        # Vérifier correct_answer
        # ----------------------------------------------------

        if "correct_answer" not in question:

            raise ValueError(
                f"La question {index} "
                f"ne contient pas 'correct_answer'."
            )

        bonne_reponse = str(
            question["correct_answer"]
        ).strip().upper()

        if bonne_reponse not in [
            "A",
            "B",
            "C",
            "D"
        ]:

            raise ValueError(
                f"La bonne réponse de la question "
                f"{index} doit être A, B, C ou D."
            )

        question["correct_answer"] = bonne_reponse

        # ----------------------------------------------------
        # Vérifier explanation
        # ----------------------------------------------------

        if "explanation" not in question:

            raise ValueError(
                f"La question {index} "
                f"ne contient pas 'explanation'."
            )

        if not str(
            question["explanation"]
        ).strip():

            raise ValueError(
                f"L'explication de la question "
                f"{index} est vide."
            )

    # ========================================================
    # FIN
    # ========================================================

    print("\n==============================================")
    print("       NIVEAU TERMINE")
    print("==============================================")

    print(
        f"{len(questions)} questions générées "
        f"pour le niveau {niveau}."
    )

    return questions