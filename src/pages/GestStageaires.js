import "./GestStageaires.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function GestStageaires() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [stagiaires, setStagiaires] = useState([]);
    const [nombreStagiaires, setNombreStagiaires] = useState(0);


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
    // RECUPERER LES STAGIAIRES
    // =====================================================

    useEffect(() => {

        if (!user) {
            return;
        }

        const fetchStagiaires = async () => {

            try {

                const response = await fetch(
                    `http://localhost:5000/mes-stagiaires?nom=${encodeURIComponent(user.username)}`
                );

                const data = await response.json();

                if (!response.ok) {

                    console.error(
                        "Erreur :",
                        data.message
                    );

                    return;

                }

                setStagiaires(data);

            } catch (error) {

                console.error(
                    "Erreur récupération stagiaires :",
                    error
                );

            }

        };

        fetchStagiaires();

    }, [user]);


    // =====================================================
    // RECUPERER LE NOMBRE DE STAGIAIRES
    // =====================================================

    useEffect(() => {

        if (!user) {
            return;
        }

        const fetchNombreStagiaires = async () => {

            try {

                const response = await fetch(
                    `http://localhost:5000/nombre-stagiaires?nom=${encodeURIComponent(user.username)}`
                );

                const data = await response.json();

                if (!response.ok) {

                    console.error(
                        "Erreur nombre stagiaires :",
                        data.message
                    );

                    return;

                }

                setNombreStagiaires(
                    data.nombre
                );

            } catch (error) {

                console.error(
                    "Erreur récupération nombre stagiaires :",
                    error
                );

            }

        };

        fetchNombreStagiaires();

    }, [user]);


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
    // AJOUTER UN STAGIAIRE
    // =====================================================

    const handleAjouter = () => {

        navigate("/ajouter-stagiaire");

    };


    // =====================================================
    // SUPPRIMER UN STAGIAIRE
    // =====================================================

    const handleSupprimer = async (id) => {

        const confirmation = window.confirm(
            "Voulez-vous vraiment supprimer ce stagiaire ?"
        );

        if (!confirmation) {
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:5000/supprimer-stagiaire/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {

                console.error(
                    "Erreur :",
                    data.message
                );

                alert(
                    data.message ||
                    "Erreur lors de la suppression."
                );

                return;

            }


            // =================================================
            // METTRE A JOUR LA LISTE
            // =================================================

            setStagiaires(
                stagiaires.filter(
                    (stagiaire) =>
                        stagiaire.id !== id
                )
            );


            // =================================================
            // METTRE A JOUR LE NOMBRE
            // =================================================

            setNombreStagiaires(
                (ancienNombre) =>
                    Math.max(
                        0,
                        ancienNombre - 1
                    )
            );


            console.log(
                data.message
            );

        } catch (error) {

            console.error(
                "Erreur suppression stagiaire :",
                error
            );

            alert(
                "Impossible de contacter le serveur."
            );

        }

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


                {/* =====================================================
                    MENU
                ===================================================== */}

                <nav>

                    {/* TABLEAU DE BORD */}

                    


                    {/* GESTION DES STAGIAIRES */}

                    <button
                        className="active"
                        onClick={() =>
                            navigate("/gest_stageaires")
                        }
                    >
                        🎓 Gestion des stagiaires
                    </button>


                    {/* GESTION DES COURS */}

                    <button
                        onClick={() =>
                            navigate("/gest_cours")
                        }
                    >
                        📖 Gestion des cours
                    </button>

                </nav>

            </aside>


            {/* =====================================================
                CONTENU
            ===================================================== */}

            <main className="content">


                {/* =====================================================
                    TITRE + BOUTON AJOUTER
                ===================================================== */}

                <div className="page-header">

                    <h1>
                       🎓 Gestion des stagiaires
                    </h1>

                    <button
                        className="ajouter-stagiaire-btn"
                        onClick={handleAjouter}
                    >
                        + Ajouter
                    </button>

                </div>


                {/* =====================================================
                    NOMBRE DE STAGIAIRES
                ===================================================== */}

                <p>
                    Nombre des stagiaires :{" "}
                    {nombreStagiaires}
                </p>


                {/* =====================================================
                    LISTE DES STAGIAIRES
                ===================================================== */}

                <div className="stagiaires-list">

                    {stagiaires.map((stagiaire) => (

                        <div
                            className="stagiaire-card"
                            key={stagiaire.id}
                        >

                            <div className="stagiaire-info">


                                {/* =================================================
                                    ID
                                ================================================= */}

                                <span className="stagiaire-id">

                                    ID :{" "}
                                    {stagiaire.id}

                                </span>


                                {/* =================================================
                                    NOM
                                ================================================= */}

                                <span className="stagiaire-nom">

                                    {stagiaire.username}

                                </span>


                                {/* =================================================
                                    EMAIL
                                ================================================= */}

                                <span className="stagiaire-email">

                                    {stagiaire.email}

                                </span>


                                {/* =================================================
                                    NOMBRE DE COURS SUIVIS
                                ================================================= */}

                                <span className="stagiaire-cours">

                                    📖 Cours suivis :{" "}
                                    {stagiaire.nombre_cours}

                                </span>


                                {/* =================================================
                                    NOMBRE D'EXAMENS PASSES
                                ================================================= */}

                                <span className="stagiaire-examens">

                                    📝 Examens passés :{" "}
                                    {stagiaire.nombre_examens}

                                </span>

                            </div>


                            {/* =====================================================
                                BOUTON SUPPRIMER
                            ===================================================== */}

                            <button
                                className="supprimer-stagiaire-btn"
                                onClick={() =>
                                    handleSupprimer(
                                        stagiaire.id
                                    )
                                }
                                title="Supprimer le stagiaire"
                            >
                                🗑️
                            </button>

                        </div>

                    ))}

                </div>


                {/* =====================================================
                    AUCUN STAGIAIRE
                ===================================================== */}

                {stagiaires.length === 0 && (

                    <div className="aucun-stagiaire">

                        Aucun stagiaire trouvé.

                    </div>

                )}

            </main>

        </div>

    );

}

export default GestStageaires;