import "./Examens.css";
import { useNavigate } from "react-router-dom";

function Examen() {

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();


  // =====================================================
  // COMMENCER UN EXAMEN
  // =====================================================

  const commencerExamen = async (degre) => {

    // Vérifier que l'utilisateur est connecté
    if (!user || !user.id) {

      alert("Utilisateur non connecté.");

      navigate("/");

      return;
    }


    console.log("ID utilisateur :", user.id);
    console.log("Degré examen :", degre);


    try {

      const response = await fetch(
        "http://localhost:5000/creer-examen",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            id: user.id,

            degre: degre

          })

        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message || "Erreur lors de la création de l'examen"
        );

      }


      console.log(
        "Examen créé :",
        data.examen
      );


      // =================================================
      // L'EXAMEN EST CRÉÉ DANS POSTGRESQL
      // =================================================

      // On peut maintenant commencer l'examen

      navigate(`/examen/${degre}`);


    } catch (error) {

      console.error(
        "ERREUR CREATION EXAMEN :",
        error
      );

      alert(
        "Impossible de créer l'examen : " +
        error.message
      );

    }

  };


  return (

    <div className="dashboard">


      {/* =========================
          BARRE GAUCHE
      ========================== */}

      <aside className="sidebar">

        <div className="profile">

          <div className="avatar">
            👤
          </div>

          <h3>
            {user?.username}
          </h3>

          <p>
            🎓 {user?.role}
          </p>

        </div>


        {/* =========================
            MENU
        ========================== */}

        <nav>

          <button onClick={() => navigate("/accueil")}>
            ▦ Tableau de bord
          </button>

          <button onClick={() => navigate("/chat")}>
            📚 Question / Réponse
          </button>

          <button onClick={() => navigate("/cours")}>
            📖 Cours à apprendre
          </button>

          <button onClick={() => navigate("/Exercices")}>
            💡 Exercices
          </button>

          <button className="active">
            📝 Examens
          </button>

        </nav>

      </aside>


      {/* =========================
          PARTIE PRINCIPALE
      ========================== */}

      <main className="content">

        <h1>
          Examens
        </h1>

        <p className="subtitle">
          Choisissez le niveau de difficulté de votre examen
        </p>


        {/* =========================
            LES 3 NIVEAUX
        ========================== */}

        <div className="exam-levels">


          {/* FACILE */}

          <div className="exam-card facile">

            <div className="exam-icon">
              🟢
            </div>

            <h2>
              Facile
            </h2>

            <p>
              Testez vos connaissances fondamentales
              et les notions principales des cours.
            </p>

            <div className="question-count">
              📝 5 questions
            </div>

            <button
              onClick={() => commencerExamen("facile")}
            >
              Commencer
            </button>

          </div>


          {/* MOYEN */}

          <div className="exam-card moyen">

            <div className="exam-icon">
              🟠
            </div>

            <h2>
              Moyen
            </h2>

            <p>
              Testez votre compréhension et votre capacité
              à appliquer les notions étudiées.
            </p>

            <div className="question-count">
              📝 5 questions
            </div>

            <button
              onClick={() => commencerExamen("moyen")}
            >
              Commencer
            </button>

          </div>


          {/* DIFFICILE */}

          <div className="exam-card difficile">

            <div className="exam-icon">
              🔴
            </div>

            <h2>
              Difficile
            </h2>

            <p>
              Mettez à l'épreuve votre capacité d'analyse
              et de raisonnement.
            </p>

            <div className="question-count">
              📝 5 questions
            </div>

            <button
              onClick={() => commencerExamen("difficile")}
            >
              Commencer
            </button>

          </div>

        </div>

      </main>

    </div>

  );

}

export default Examen;