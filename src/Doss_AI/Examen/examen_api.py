from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .examen_ai import generer_niveau_examen


router = APIRouter(
    prefix="/examen",
    tags=["Examen"]
)


class ExamenRequest(BaseModel):
    niveau: str


@router.post("/generer")
def generer_examen(request: ExamenRequest):

    niveau = request.niveau.strip().lower()

    niveaux_autorises = [
        "facile",
        "moyen",
        "difficile"
    ]

    if niveau not in niveaux_autorises:
        raise HTTPException(
            status_code=400,
            detail=(
                "Niveau invalide. "
                "Utilisez : facile, moyen ou difficile."
            )
        )

    try:

        questions = generer_niveau_examen(
            niveau=niveau,
            nombre_questions=5
        )

        return {
            "success": True,
            "niveau": niveau,
            "nombre_questions": len(questions),
            "questions": questions
        }

    except Exception as e:

        print("\n==============================================")
        print("ERREUR GENERATION EXAMEN")
        print("==============================================")
        print(str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )