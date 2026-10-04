import fitz
import os

docs_folder = "Docs"

texte_complet = ""

# Lire tous les PDF
for file in os.listdir(docs_folder):

    if file.endswith(".pdf"):

        pdf = fitz.open(os.path.join(docs_folder, file))

        for page in pdf:
            texte_complet += page.get_text() + "\n"

        pdf.close()

print("Nombre de caractères :", len(texte_complet))


# -----------------------
# Découpage en chunks
# -----------------------

taille_chunk = 500

chunks = []

for i in range(0, len(texte_complet), taille_chunk):

    chunk = texte_complet[i:i+taille_chunk]

    chunks.append(chunk)


print("Nombre de chunks :", len(chunks))

print("\nPremier chunk :\n")

print(chunks[0])