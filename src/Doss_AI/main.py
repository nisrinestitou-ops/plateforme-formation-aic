from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os

# ============================================================
# IMPORT POUR LE CHAT
# ============================================================

from search import generate_answer

# ============================================================
# IMPORT POUR LA GENERATION DES EXERCICES
# ============================================================

from exercise_api import generate_exercises

# ============================================================
# IMPORT POUR LA GENERATION DES EXAMENS
# ============================================================

from Examen.examen_api import router as examen_router
# ============================================================
# CREATION DE L'APPLICATION FASTAPI
# ============================================================

app = FastAPI()

# ============================================================
# ROUTER EXAMEN
# ============================================================

app.include_router(examen_router)
# ============================================================
# DOSSIER CONTENANT LES PDF
# ============================================================
print("\n================ ROUTES EXAMEN ================")

for route in examen_router.routes:
    print(route.path, route.methods)

print("===============================================\n")
DOCS_FOLDER = "docs"


# ============================================================
# CONFIGURATION CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# MODELE POUR LE CHAT
# ============================================================

class Question(BaseModel):
    question: str


# ============================================================
# MODELE POUR LES EXERCICES
# ============================================================

class ExerciseRequest(BaseModel):
    course: str


# ============================================================
# ROUTE PRINCIPALE
# ============================================================

@app.get("/")
def home():

    return {
        "message": "API IA démarrée avec succès."
    }


# ============================================================
# ROUTE CHAT
# ============================================================

@app.post("/chat")
def chat(data: Question):

    # Question reçue depuis React
    question = data.question

    # Génération de la réponse avec le RAG
    answer = generate_answer(question)

    # Réponse envoyée à React
    return {
        "answer": answer
    }


# ============================================================
# ROUTE LISTE DES COURS
# ============================================================

@app.get("/courses")
def get_courses():

    pdfs = []

    # Vérifier que le dossier existe
    if not os.path.exists(DOCS_FOLDER):

        return {
            "error": "Le dossier docs n'existe pas."
        }

    # Parcourir les fichiers du dossier
    for file in os.listdir(DOCS_FOLDER):

        if file.lower().endswith(".pdf"):

            pdfs.append({
                "name": file
            })

    return pdfs


# ============================================================
# ROUTE POUR OUVRIR / TELECHARGER UN PDF
# ============================================================

@app.get("/pdf/{filename}")
def open_pdf(filename: str):

    file_path = os.path.join(
        DOCS_FOLDER,
        filename
    )

    # Vérifier si le fichier existe
    if not os.path.exists(file_path):

        return {
            "error": "Fichier introuvable"
        }

    # Retourner le PDF
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=filename
    )


# ============================================================
# ROUTE POUR GENERER LES EXERCICES
# ============================================================

@app.post("/generate-exercise")
def generate_exercise(data: ExerciseRequest):

    # Cours reçu depuis React
    course = data.course

    # Vérification
    if not course.strip():

        return {
            "error": "Le cours ne peut pas être vide."
        }

    # Génération des QCM
    exercises = generate_exercises(
        course,
        number_questions=3
    )

    # Retourner les questions à React
    return {
        "course": course,
        "questions": exercises
    }