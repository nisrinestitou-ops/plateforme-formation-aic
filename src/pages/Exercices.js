import { useState } from "react";
import "./Exercices.css";

function Exercices() {
  // ==============================
  // États
  // ==============================

  const [course, setCourse] = useState("");

  const [questions, setQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [userAnswers, setUserAnswers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [finished, setFinished] = useState(false);

  // ==============================
  // Générer l'exercice
  // ==============================

  const genererExercice = async () => {
    if (course.trim() === "") {
      setError("Veuillez sélectionner ou saisir un cours.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/generate-exercise",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            course: course,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la génération de l'exercice.");
      }

      const data = await response.json();

      console.log("Exercice reçu :", data);

      if (!data.questions || data.questions.length === 0) {
        throw new Error("Aucune question n'a été générée.");
      }

      setQuestions(data.questions);

      setCurrentQuestion(0);

      setSelectedAnswer("");

      setUserAnswers([]);

      setFinished(false);

    } catch (err) {
      console.error(err);

      setError(
        "Impossible de générer l'exercice. Vérifiez que FastAPI et Ollama sont démarrés."
      );
    }

    setLoading(false);
  };

  // ==============================
  // Sélection d'une réponse
  // ==============================

  const choisirReponse = (answer) => {
    setSelectedAnswer(answer);
  };

  // ==============================
  // Question suivante
  // ==============================

  const questionSuivante = () => {
    if (selectedAnswer === "") {
      setError("Veuillez sélectionner une réponse.");
      return;
    }

    setError("");

    // Enregistrer la réponse
    const nouvellesReponses = [...userAnswers];

    nouvellesReponses[currentQuestion] = selectedAnswer;

    setUserAnswers(nouvellesReponses);

    // Vérifier si c'est la dernière question
    if (currentQuestion === questions.length - 1) {
      setFinished(true);
      return;
    }

    // Passer à la question suivante
    setCurrentQuestion(currentQuestion + 1);

    setSelectedAnswer("");
  };

  // ==============================
  // Recommencer
  // ==============================

  const recommencer = () => {
    setQuestions([]);

    setCurrentQuestion(0);

    setSelectedAnswer("");

    setUserAnswers([]);

    setFinished(false);

    setError("");
  };

  // ==============================
  // Calcul du score
  // ==============================

  const calculerScore = () => {
    let score = 0;

    questions.forEach((question, index) => {
      if (
        userAnswers[index] === question.correct_answer
      ) {
        score++;
      }
    });

    return score;
  };

  // ==============================
  // Si exercice terminé
  // ==============================

  if (finished) {
    const score = calculerScore();

    const erreurs = questions.length - score;

    return (
      <div className="exercices-container">

        <div className="result-container">

          <h1>🎉 Exercice terminé</h1>

          <div className="score-box">

            <h2>
              Score : {score} / {questions.length}
            </h2>

            <p className="correct">
              ✅ Bonnes réponses : {score}
            </p>

            <p className="wrong">
              ❌ Erreurs : {erreurs}
            </p>

          </div>

          <h2 className="correction-title">
            Correction
          </h2>

          {questions.map((question, index) => {

            const userAnswer = userAnswers[index];

            const isCorrect =
              userAnswer === question.correct_answer;

            return (
              <div
                className={
                  isCorrect
                    ? "correction-card correct-card"
                    : "correction-card wrong-card"
                }
                key={index}
              >

                <h3>
                  Question {index + 1}
                </h3>

                <p className="question-text">
                  {question.question}
                </p>

                <p>
                  <strong>Votre réponse :</strong>{" "}
                  {userAnswer || "Aucune réponse"}
                </p>

                <p>
                  <strong>Bonne réponse :</strong>{" "}
                  {question.correct_answer}
                </p>

                <p className="result-message">
                  {isCorrect
                    ? "✅ Bonne réponse"
                    : "❌ Mauvaise réponse"}
                </p>

                <div className="explanation">

                  <strong>💡 Explication :</strong>

                  <p>
                    {question.explanation}
                  </p>

                </div>

              </div>
            );
          })}

          <button
            className="restart-button"
            onClick={recommencer}
          >
            🔄 Recommencer
          </button>

        </div>

      </div>
    );
  }

  // ==============================
  // Interface principale
  // ==============================

  return (
    <div className="exercices-container">

      <div className="exercise-header">

        <h1>💡 Exercices</h1>

        <p>
          Testez vos connaissances avec des exercices
          générés automatiquement par l'IA.
        </p>

      </div>

      {/* ==============================
          Sélection du cours
          ============================== */}

      {questions.length === 0 && (

        <div className="course-selection">

          <h2>
            Choisissez votre cours
          </h2>

          <p>
            Entrez le thème sur lequel vous souhaitez
            faire un exercice.
          </p>

          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Exemple : MERISE"
            className="course-input"
          />

          <button
            className="generate-button"
            onClick={genererExercice}
            disabled={loading}
          >

            {loading
              ? "⏳ Génération en cours..."
              : "🚀 Générer l'exercice"}

          </button>

          {loading && (
            <p className="loading-text">
              L'IA prépare vos questions...
            </p>
          )}

          {error && (
            <p className="error-message">
              ⚠️ {error}
            </p>
          )}

        </div>

      )}

      {/* ==============================
          QCM
          ============================== */}

      {questions.length > 0 && !finished && (

        <div className="quiz-container">

          <div className="quiz-top">

            <span>
              Cours : <strong>{course}</strong>
            </span>

            <span>
              Question{" "}
              {currentQuestion + 1}
              {" / "}
              {questions.length}
            </span>

          </div>

          <div className="progress-container">

            <div
              className="progress-bar"
              style={{
                width: `${
                  ((currentQuestion + 1) /
                    questions.length) *
                  100
                }%`,
              }}
            />

          </div>

          <div className="question-card">

            <h2>
              Question {currentQuestion + 1}
            </h2>

            <p className="question-text">
              {questions[currentQuestion].question}
            </p>

            <div className="choices">

              {["A", "B", "C", "D"].map(
                (choice) => (

                  <button
                    key={choice}
                    className={
                      selectedAnswer === choice
                        ? "choice selected"
                        : "choice"
                    }
                    onClick={() =>
                      choisirReponse(choice)
                    }
                  >

                    <span className="choice-letter">
                      {choice}
                    </span>

                    <span>
                      {
                        questions[
                          currentQuestion
                        ].choices[choice]
                      }
                    </span>

                  </button>

                )
              )}

            </div>

          </div>

          {error && (
            <p className="error-message">
              ⚠️ {error}
            </p>
          )}

          <div className="quiz-footer">

            <button
              className="next-button"
              onClick={questionSuivante}
            >

              {currentQuestion ===
              questions.length - 1
                ? "✅ Terminer"
                : "Question suivante →"}

            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Exercices;