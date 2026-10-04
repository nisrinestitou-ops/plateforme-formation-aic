import fitz
import os
from sentence_transformers import SentenceTransformer
import pickle

# -----------------------------
# Chargement du modèle
# -----------------------------
print("Chargement du modèle...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Modèle chargé.\n")

# -----------------------------
# Lecture des PDF
# -----------------------------
docs_folder = "Docs"

texte = ""

for file in os.listdir(docs_folder):

    if file.endswith(".pdf"):

        pdf = fitz.open(os.path.join(docs_folder, file))

        for page in pdf:
            texte += page.get_text() + "\n"

        pdf.close()

print("Nombre de caractères :", len(texte))

# -----------------------------
# Création des chunks
# -----------------------------
taille_chunk = 500

chunks = []

for i in range(0, len(texte), taille_chunk):

    chunks.append(texte[i:i+taille_chunk])

print("Nombre de chunks :", len(chunks))

# -----------------------------
# Création des embeddings
# -----------------------------
print("\nCréation des embeddings...")

embeddings = model.encode(chunks)

print("Embeddings créés.")

print("Nombre d'embeddings :", len(embeddings))

print("Dimension d'un embedding :", len(embeddings[0]))

# -----------------------------
# Sauvegarde
# -----------------------------
data = {

    "chunks": chunks,
    "embeddings": embeddings

}

with open("embeddings.pkl", "wb") as f:

    pickle.dump(data, f)

print("\nEmbeddings sauvegardés dans embeddings.pkl")