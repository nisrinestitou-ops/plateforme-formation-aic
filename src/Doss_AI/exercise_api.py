from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from exercise_ai import generate_exercises


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="Plateforme de Formation - API IA",
    version="1.0.0"
)


# ============================================================
# CORS POUR REACT
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ============================================================
# MODELE DE REQUETE
# ============================================================

class ExerciseRequest(BaseModel):

    course: str

    number_questions: int = 3


# ============================================================
# ROUTE ACCUEIL
# ============================================================

@app.get("/")
def home():

    return {
        "message": "API de génération d'exercices opérationnelle"
    }


# ============================================================
# ROUTE GENERATION EXERCICES
# ============================================================

@app.post("/generate-exercise")
def generate_exercise(request: ExerciseRequest):

    try:

        questions = generate_exercises(
            request.course,
            request.number_questions
        )

        return {
            "course": request.course,
            "questions": questions
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        print("\nERREUR API :")
        print(e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )