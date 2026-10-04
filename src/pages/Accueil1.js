import "./Accueil1.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Accueil1() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);


    // ==============================
    // RECUPERER L'UTILISATEUR
    // ==============================

    useEffect(() => {

        const userStorage = localStorage.getItem("user");

        if (!userStorage) {
            navigate("/");
            return;
        }

        try {

            const userData = JSON.parse(userStorage);

            setUser(userData);

        } catch (error) {

            console.error("Erreur utilisateur :", error);

            localStorage.removeItem("user");

            navigate("/");

        }

    }, [navigate]);


    // ==============================
    // ATTENDRE LE CHARGEMENT USER
    // ==============================

    if (!user) {

        return (
            <div style={{
                padding: "40px",
                textAlign: "center"
            }}>
                Chargement...
            </div>
        );

    }


    // ==============================
    // INTERFACE
    // ==============================

    return (

        <div className="dashboard">


            {/* =====================================
                SIDEBAR
            ===================================== */}

            <aside className="sidebar">


                {/* PROFIL */}

                <div className="profile">

                    <div className="avatar">
                        👨‍🏫
                    </div>

                    <h3>
                        {user.username}
                    </h3>

                    <p>
                        👨‍🏫 {user.role}
                    </p>

                </div>


                {/* MENU */}

                <nav>


                    {/* TABLEAU DE BORD */}

                    


                    {/* GESTION DES STAGIAIRES */}

                    <button
                        onClick={() => navigate("/gest_stageaires")}
                    >
                        🎓 Gestion des stagiaires
                    </button>


                    {/* GESTION DES COURS */}

                    <button
                        onClick={() => navigate("/gest_cours")}
                    >
                        📖 Gestion des cours
                    </button>


                </nav>

            </aside>


            {/* =====================================
                CONTENU PRINCIPAL
            ===================================== */}

            <main className="content">


                <h1>
                    Tableau de bord Formateur
                </h1>


                {/* MESSAGE DE BIENVENUE */}

                <div className="welcome">

                    <h2>
                        Bienvenue, {user.username} 👋
                    </h2>

                    <p>
                        Voici votre espace de gestion.
                    </p>

                </div>


                {/* =====================================
                    CARTES
                ===================================== */}

                <div className="cards">


                    {/* STAGIAIRES */}

                    <div className="card">

                        <h3>
                            👨‍🎓 Stagiaires
                        </h3>

                        <p>
                            Nombre de stagiaires : 25
                        </p>

                        <button
                            onClick={() =>
                                navigate("/gest_stageaires")
                            }
                        >
                            Voir les stagiaires
                        </button>

                    </div>


                    {/* COURS */}

                    <div className="card">

                        <h3>
                            📖 Cours
                        </h3>

                        <p>
                            Cours créés : 12
                        </p>

                        <button
                            onClick={() =>
                                navigate("/GestCours")
                            }
                        >
                            Gérer les cours
                        </button>

                    </div>


                    {/* EXAMENS */}

                    <div className="card">

                        <h3>
                            📝 Examens
                        </h3>

                        <p>
                            Examens créés : 5
                        </p>

                    </div>


                </div>

            </main>

        </div>

    );

}

export default Accueil1;