import pickle
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import ollama

# -----------------------------
# Chargement des embeddings
# -----------------------------
with open("embeddings.pkl", "rb") as f:
    data = pickle.load(f)

chunks = data["chunks"]
embeddings = data["embeddings"]

# -----------------------------
# Chargement du modèle d'embeddings
# -----------------------------
model = SentenceTransformer("all-MiniLM-L6-v2")


# ==========================================================
# Fonction appelée par FastAPI
# ==========================================================

def generate_answer(question):

    # Embedding de la question
    question_embedding = model.encode([question])

    # Recherche des meilleurs chunks
    scores = cosine_similarity(question_embedding, embeddings)[0]

    top_indices = scores.argsort()[-3:][::-1]

    context = ""

    for i in top_indices:
        context += chunks[i]
        context += "\n\n"

    # Prompt envoyé au LLM
    prompt = f"""
Tu es un assistant pédagogique.

Réponds uniquement à partir du contexte suivant.

Si la réponse n'existe pas dans le contexte, réponds exactement :

Je ne trouve pas cette information dans le document.

Contexte :

{context}

Question :

{question}
"""

    # Appel à Ollama
    response = ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    # Retour de la réponse
    return response["message"]["content"]


# ==========================================================
# Test uniquement si on exécute search.py directement
# ==========================================================

if __name__ == "__main__":

    question = input("Votre question : ")

    reponse = generate_answer(question)

    print("\n==============================")
    print("Réponse IA :\n")
    print(reponse)