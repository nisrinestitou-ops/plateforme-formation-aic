import "./AjouterStagiaire.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function AjouterStagiaire() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    // =====================================================
    // RECUPERER L'UTILISATEUR
    // =====================================================

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

            console.error(
                "Erreur utilisateur :",
                error
            );

            localStorage.removeItem("user");

            navigate("/");

        }

    }, [navigate]);


    // =====================================================
    // AJOUTER LE STAGIAIRE
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        if (!username || !email) {

            setError(
                "Veuillez remplir tous les champs."
            );

            return;
        }


        setLoading(true);


        try {

            const response = await fetch(
                "http://localhost:5000/ajouter-stagiaire",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        username: username,

                        email: email,

                        nom_formateur: user.username

                    })

                }
            );


            const data = await response.json();


            if (!response.ok) {

                setError(
                    data.message ||
                    "Erreur lors de l'ajout du stagiaire."
                );

                setLoading(false);

                return;
            }


            console.log(
                "Stagiaire ajouté :",
                data.stagiaire
            );


            setMessage(
                "Stagiaire ajouté avec succès !"
            );


            // Afficher les informations générées

            alert(
                "Stagiaire ajouté avec succès !\n\n" +
                "Username : " +
                data.stagiaire.username +
                "\n" +
                "Email : " +
                data.stagiaire.email +
                "\n" +
                "Password : " +
                data.stagiaire.password +
                "\n" +
                "ID : " +
                data.stagiaire.id
            );


            // Retour vers la liste

            navigate("/gest_stageaires");


        } catch (error) {

            console.error(
                "Erreur ajout stagiaire :",
                error
            );

            setError(
                "Impossible de contacter le serveur."
            );

        }


        setLoading(false);

    };


    // =====================================================
    // ATTENDRE LE CHARGEMENT
    // =====================================================

    if (!user) {

        return (
            <div className="loading">
                Chargement...
            </div>
        );

    }


    // =====================================================
    // ANNULER
    // =====================================================

    const handleAnnuler = () => {

        navigate("/gest_stageaires");

    };


    // =====================================================
    // INTERFACE
    // =====================================================

    return (

        <div className="dashboard">


            {/* =====================================================
                SIDEBAR
            ===================================================== */}

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

                    <button
                        onClick={() =>
                            navigate("/accueil")
                        }
                    >
                        ▦ Tableau de bord
                    </button>


                    <button
                        className="active"
                        onClick={() =>
                            navigate("/gest_stageaires")
                        }
                    >
                        🎓 Gestion des stagiaires
                    </button>


                    <button
                        onClick={() =>
                            navigate("/gest_cours")
                        }
                    >
                        📖 Gestion des cours
                    </button>


                    <button
                        onClick={() => {

                            localStorage.removeItem("user");

                            navigate("/");

                        }}
                        className="logout-btn"
                    >
                        🚪 Déconnexion
                    </button>

                </nav>

            </aside>


            {/* =====================================================
                CONTENU
            ===================================================== */}

            <main className="content">


                {/* TITRE */}

                <h1>
                    Ajouter un stagiaire
                </h1>


                {/* =====================================================
                    FORMULAIRE
                ===================================================== */}

                <div className="ajouter-stagiaire-container">

                    <form
                        className="ajouter-stagiaire-form"
                        onSubmit={handleSubmit}
                    >


                        {/* USERNAME */}

                        <div className="form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                placeholder="Entrer le username"
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="Entrer l'adresse email"
                            />

                        </div>


                        {/* MESSAGE ERREUR */}

                        {error && (

                            <div className="error-message">
                                {error}
                            </div>

                        )}


                        {/* MESSAGE SUCCES */}

                        {message && (

                            <div className="success-message">
                                {message}
                            </div>

                        )}


                        {/* BOUTONS */}

                        <div className="form-buttons">

                            <button
                                type="button"
                                className="annuler-btn"
                                onClick={handleAnnuler}
                            >
                                Annuler
                            </button>


                            <button
                                type="submit"
                                className="ajouter-btn"
                                disabled={loading}
                            >

                                {loading
                                    ? "Ajout..."
                                    : "Ajouter"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>

    );

}

export default AjouterStagiaire;