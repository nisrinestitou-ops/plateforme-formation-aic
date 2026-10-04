import "./Accueil.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Accueil1 from "./Accueil1";

function Accueil() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [dashboard, setDashboard] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");


  // =====================================================
  // RECUPERER LES DONNEES DU STAGIAIRE
  // =====================================================

  useEffect(() => {

    if (!user) {

      navigate("/");

      return;

    }


    // ===================================================
    // SI FORMATEUR
    // ===================================================

    if (user.role === "formateur") {

      setChargement(false);

      return;

    }


    // ===================================================
    // RECUPERER LE DASHBOARD
    // ===================================================

    fetch(
      `http://localhost:5000/dashboard-stagiaire/${user.id}`
    )

      .then((response) => {

        if (!response.ok) {

          throw new Error(
            "Erreur lors de récupération des données"
          );

        }

        return response.json();

      })

      .then((data) => {

        console.log(
          "Dashboard stagiaire :",
          data
        );

        setDashboard(data);

        setChargement(false);

      })

      .catch((error) => {

        console.error(
          "Erreur dashboard :",
          error
        );

        setErreur(
          "Impossible de récupérer les données du dashboard"
        );

        setChargement(false);

      });

  }, [navigate]);


  // =====================================================
  // AUCUN UTILISATEUR
  // =====================================================

  if (!user) {

    return null;

  }


  // =====================================================
  // FORMATEUR
  // =====================================================

  if (user.role === "formateur") {

    return <Accueil1 />;

  }


  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (chargement) {

    return (

      <div className="dashboard">

        <main className="content">

          <h1>
            Tableau de bord
          </h1>

          <p>
            Chargement des données...
          </p>

        </main>

      </div>

    );

  }


  // =====================================================
  // ERREUR
  // =====================================================

  if (erreur) {

    return (

      <div className="dashboard">

        <main className="content">

          <h1>
            Tableau de bord
          </h1>

          <p>
            {erreur}
          </p>

        </main>

      </div>

    );

  }


  // =====================================================
  // VERIFICATION DASHBOARD
  // =====================================================

  if (!dashboard) {

    return null;

  }


  // =====================================================
  // DONNEES COURS
  // =====================================================

  const coursTotal =
    dashboard.cours.total;

  const coursSuivis =
    dashboard.cours.suivis;

  const progressionCours =
    dashboard.cours.progression;


  // =====================================================
  // DONNEES EXAMENS
  // =====================================================

  const examensTotal =
    dashboard.examens.total;

  const examensRealises =
    dashboard.examens.realises;

  const progressionExamens =
    dashboard.examens.progression;


  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (

    <div className="dashboard">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">


        <div className="profile">

          <div className="avatar">
            👤
          </div>


          <h3>
            {user.username}
          </h3>


          <p>
            🎓 {user.role}
          </p>

        </div>


        <nav>


          <button className="active">
            ▦ Tableau de bord
          </button>


          <button
            onClick={() => navigate("/cours")}
          >
            📖 Cours à apprendre
          </button>


          <button
            onClick={() => navigate("/chat")}
          >
            📚 Question / Réponse
          </button>


          <button
            onClick={() => navigate("/Exercices")}
          >
            💡 Exercices
          </button>


          <button
            onClick={() => navigate("/examens")}
          >
            📝 Examens
          </button>


        </nav>


      </aside>


      {/* =================================================
          CONTENU
      ================================================= */}

      <main className="content">


        <h1>
          Tableau de bord
        </h1>


        {/* =================================================
            CARTES
        ================================================= */}

        <div className="cards">


          {/* ===============================================
              CARTE COURS
          =============================================== */}

          <div className="card">

            <h3>
              📖 Cours
            </h3>


            <p>
              Cours suivis :
              <strong>
                {" "}
                {coursSuivis} / {coursTotal}
              </strong>
            </p>


            <p>
              Progression :
              <strong>
                {" "}
                {progressionCours}%
              </strong>
            </p>


          </div>


          {/* ===============================================
              CARTE EXAMENS
          =============================================== */}

          <div className="card">

            <h3>
              📝 Examens
            </h3>


            <p>
              Examens réalisés :
              <strong>
                {" "}
                {examensRealises} / {examensTotal}
              </strong>
            </p>


            <p>
              Progression :
              <strong>
                {" "}
                {progressionExamens}%
              </strong>
            </p>


          </div>


          {/* ===============================================
              CARTE PROGRESSION GENERALE
          =============================================== */}

          <div className="card">

            <h3>
              📊 Progression générale
            </h3>


            <p>
              Cours :
              <strong>
                {" "}
                {progressionCours}%
              </strong>
            </p>


            <p>
              Examens :
              <strong>
                {" "}
                {progressionExamens}%
              </strong>
            </p>


          </div>


        </div>


        {/* =================================================
            PARCOURS DE FORMATION
        ================================================= */}

        <div className="progress-box">


          <h2>
            Parcours de formation
          </h2>


          <div className="levels">


            <span
              className={
                progressionCours >= 20
                  ? "done"
                  : ""
              }
            >
              Débutant
            </span>


            <span
              className={
                progressionCours >= 40
                  ? "done"
                  : ""
              }
            >
              Intermédiaire
            </span>


            <span
              className={
                progressionCours >= 60
                  ? "done"
                  : ""
              }
            >
              Avancé
            </span>


            <span
              className={
                progressionCours >= 80
                  ? "done"
                  : ""
              }
            >
              Expert
            </span>


            <span
              className={
                progressionCours >= 100
                  ? "done"
                  : ""
              }
            >
              Niveau IA
            </span>


          </div>


        </div>


      </main>


    </div>

  );

}

export default Accueil;