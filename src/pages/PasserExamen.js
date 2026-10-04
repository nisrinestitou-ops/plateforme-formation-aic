import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PasserExamen.css";

function PasserExamen() {

  const { niveau } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  // Question actuelle
  const [questionActuelle, setQuestionActuelle] = useState(0);

  // Réponse sélectionnée
  const [reponseSelectionnee, setReponseSelectionnee] = useState(null);

  // Réponses de l'étudiant
  const [reponses, setReponses] = useState([]);


  // =========================
  // GENERER L'EXAMEN
  // =========================

  useEffect(() => {

    async function genererExamen() {

      try {

        const response = await fetch(
          "http://127.0.0.1:8000/examen/generer",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              niveau: niveau
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Erreur lors de la génération"
          );
        }

        setQuestions(data.questions);

      } catch (error) {

        console.error(error);
        setErreur(error.message);

      } finally {

        setChargement(false);

      }

    }

    genererExamen();

  }, [niveau]);


  // =========================
  // CHARGEMENT
  // =========================

  if (chargement) {

    return (
      <div className="examen-loading">

        <h2>
          Génération de l'examen...
        </h2>

        <p>
          L'IA prépare vos questions.
        </p>

      </div>
    );

  }


  // =========================
  // ERREUR
  // =========================

  if (erreur) {

    return (
      <div className="examen-error">

        <h2>
          ❌ Une erreur est survenue
        </h2>

        <p>
          {erreur}
        </p>

        <button onClick={() => navigate("/examens")}>
          Retour aux examens
        </button>

      </div>
    );

  }


  // =========================
  // AUCUNE QUESTION
  // =========================

  if (questions.length === 0) {

    return (
      <div className="examen-error">

        <h2>
          Aucune question disponible.
        </h2>

        <button onClick={() => navigate("/examens")}>
          Retour aux examens
        </button>

      </div>
    );

  }


  // =========================
  // QUESTION ACTUELLE
  // =========================

  const question = questions[questionActuelle];


  // =========================
  // CHOIX D'UNE REPONSE
  // =========================

  const choisirReponse = (lettre) => {

    setReponseSelectionnee(lettre);

  };


  // =========================
  // QUESTION SUIVANTE
  // =========================

  const questionSuivante = () => {

    if (reponseSelectionnee === null) {
      alert("Veuillez sélectionner une réponse.");
      return;
    }

    // Enregistrer la réponse
    const nouvellesReponses = [...reponses];

    nouvellesReponses[questionActuelle] = reponseSelectionnee;

    setReponses(nouvellesReponses);

    // Passer à la question suivante
    if (questionActuelle < questions.length - 1) {

      setQuestionActuelle(questionActuelle + 1);

      setReponseSelectionnee(
        nouvellesReponses[questionActuelle + 1] || null
      );

    } else {

      // Pour l'instant
      alert("Examen terminé !");

      console.log(
        "Réponses de l'étudiant :",
        nouvellesReponses
      );

    }

  };


  // =========================
  // AFFICHAGE
  // =========================

  return (

    <div className="passer-examen">

      <div className="examen-header">

        <h1>
          Examen - {niveau}
        </h1>

        <p>
          Question {questionActuelle + 1} sur {questions.length}
        </p>

      </div>


      <div className="question-card">

        <h2>
          Question {questionActuelle + 1}
        </h2>

        <p className="question-text">
          {question.question}
        </p>


        {/* =========================
            CHOIX
        ========================== */}

        <div className="choices">

          {Object.entries(question.choices).map(
            ([lettre, texte]) => (

              <button
                key={lettre}
                className={
                  reponseSelectionnee === lettre
                    ? "choice selected"
                    : "choice"
                }
                onClick={() => choisirReponse(lettre)}
              >

                <span className="choice-letter">
                  {lettre}
                </span>

                <span>
                  {texte}
                </span>

              </button>

            )
          )}

        </div>


        {/* =========================
            BOUTON SUIVANT
        ========================== */}

        <div className="navigation-examen">

          <button
            className="next-button"
            onClick={questionSuivante}
          >

            {questionActuelle === questions.length - 1
              ? "Terminer l'examen"
              : "Question suivante →"}

          </button>

        </div>

      </div>

    </div>

  );
}

export default PasserExamen;