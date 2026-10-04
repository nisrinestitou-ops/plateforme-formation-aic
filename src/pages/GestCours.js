import "./GestCours.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function GestCours() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [cours, setCours] = useState([]);
    const [nombreCours, setNombreCours] = useState(0);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);


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
    // RECUPERER LES COURS
    // =====================================================

    useEffect(() => {

        if (!user) {
            return;
        }

        const recupererCours = async () => {

            try {

                const response = await fetch(
                    `http://localhost:5000/mes-cours?nom=${encodeURIComponent(user.username)}`
                );

                const data = await response.json();

                if (!response.ok) {

                    setMessage(
                        data.message ||
                        "Erreur lors de la récupération des cours"
                    );

                    setLoading(false);

                    return;
                }

                setCours(data);

                setLoading(false);

            } catch (error) {

                console.error(
                    "Erreur récupération cours :",
                    error
                );

                setMessage(
                    "Impossible de contacter le serveur"
                );

                setLoading(false);

            }

        };

        recupererCours();

    }, [user]);


    // =====================================================
    // RECUPERER LE NOMBRE DE COURS
    // =====================================================

    useEffect(() => {

        if (!user) {
            return;
        }

        const fetchNombreCours = async () => {

            try {

                const response = await fetch(
                    `http://localhost:5000/nombre-cours?nom=${encodeURIComponent(user.username)}`
                );

                const data = await response.json();

                if (!response.ok) {

                    console.error(
                        "Erreur nombre cours :",
                        data.message
                    );

                    return;
                }

                setNombreCours(data.nombre);

            } catch (error) {

                console.error(
                    "Erreur récupération nombre cours :",
                    error
                );

            }

        };

        fetchNombreCours();

    }, [user]);


    // =====================================================
    // ATTENDRE LE CHARGEMENT UTILISATEUR
    // =====================================================

    if (!user) {

        return (
            <div className="loading">
                Chargement...
            </div>
        );

    }


    // =====================================================
    // OUVRIR EXPLORATEUR
    // =====================================================

    const ouvrirExplorateur = () => {

        fileInputRef.current.click();

    };


    // =====================================================
    // AJOUTER COURS
    // =====================================================

    const ajouterCours = async (event) => {

        const fichier = event.target.files[0];

        if (!fichier) {
            return;
        }

        setUploading(true);
        setMessage("");

        try {

            const formData = new FormData();

            formData.append(
                "document",
                fichier
            );

            formData.append(
                "nom_formateur",
                user.username
            );


            const response = await fetch(
                "http://localhost:5000/ajouter-cours",
                {
                    method: "POST",
                    body: formData
                }
            );


            const data = await response.json();


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Erreur lors de l'ajout du cours"
                );

                setUploading(false);

                event.target.value = "";

                return;

            }


            // =================================================
            // AJOUTER LE COURS A LA LISTE
            // =================================================

            setCours(
                (coursActuels) => [
                    ...coursActuels,
                    data.cours
                ]
            );


            // =================================================
            // AUGMENTER LE NOMBRE DE COURS
            // =================================================

            setNombreCours(
                (ancienNombre) =>
                    ancienNombre + 1
            );


            setMessage(
                "✅ Cours ajouté avec succès"
            );

            setUploading(false);

            event.target.value = "";


        } catch (error) {

            console.error(
                "Erreur ajout cours :",
                error
            );

            setMessage(
                "Impossible de contacter le serveur"
            );

            setUploading(false);

            event.target.value = "";

        }

    };


    // =====================================================
    // OUVRIR UN COURS
    // =====================================================

    const ouvrirCours = (nomCours) => {

        window.open(
            `http://localhost:5000/ouvrir-cours/${encodeURIComponent(nomCours)}`,
            "_blank"
        );

    };


    // =====================================================
    // SUPPRIMER UN COURS
    // =====================================================

    const supprimerCours = async (idCours) => {

        const confirmation = window.confirm(
            "Voulez-vous vraiment supprimer ce cours ?"
        );

        if (!confirmation) {
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:5000/supprimer-cours/${idCours}`,
                {
                    method: "DELETE"
                }
            );


            const data = await response.json();


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Erreur lors de la suppression du cours"
                );

                return;

            }


            // =================================================
            // METTRE A JOUR LA LISTE
            // =================================================

            setCours(
                (coursActuels) =>
                    coursActuels.filter(
                        (coursItem) =>
                            coursItem.id_cours !== idCours
                    )
            );


            // =================================================
            // DIMINUER LE NOMBRE DE COURS
            // =================================================

            setNombreCours(
                (ancienNombre) =>
                    Math.max(
                        0,
                        ancienNombre - 1
                    )
            );


            setMessage(
                "✅ Cours supprimé avec succès"
            );


        } catch (error) {

            console.error(
                "Erreur suppression cours :",
                error
            );

            setMessage(
                "Impossible de contacter le serveur"
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


                {/* =================================================
                    MENU
                ================================================= */}

                <nav>

                    {/* TABLEAU DE BORD */}

                    


                    {/* GESTION DES STAGIAIRES */}

                    <button
                        onClick={() =>
                            navigate("/gest_stageaires")
                        }
                    >
                        🎓 Gestion des stagiaires
                    </button>


                    {/* GESTION DES COURS */}

                    <button className="active">
                        📖 Gestion des cours
                    </button>

                </nav>

            </aside>


            {/* =====================================================
                CONTENU
            ===================================================== */}

            <main className="content">


                {/* =================================================
                    TITRE + BOUTON AJOUTER
                ================================================= */}

                <div className="page-header">

                    <h1>
                        📖 Gestion des cours
                    </h1>

                    <button
                        className="ajouter-stagiaire-btn"
                        onClick={ouvrirExplorateur}
                        disabled={uploading}
                    >

                        {uploading
                            ? "⏳ Ajout en cours..."
                            : "+ Ajouter"
                        }

                    </button>

                </div>


                {/* =================================================
                    INPUT FICHIER
                ================================================= */}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={ajouterCours}
                    style={{
                        display: "none"
                    }}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                />


                {/* =================================================
                    NOMBRE DE COURS
                ================================================= */}

                <p>
                    Nombre de cours : {nombreCours}
                </p>


                {/* =================================================
                    MESSAGE
                ================================================= */}

                {message && (

                    <p className="message">
                        {message}
                    </p>

                )}


                {/* =================================================
                    CHARGEMENT
                ================================================= */}

                {loading && (

                    <p className="message">
                        Chargement des cours...
                    </p>

                )}


                {/* =================================================
                    AUCUN COURS
                ================================================= */}

                {!loading &&
                    !message &&
                    cours.length === 0 && (

                    <p className="message">
                        Aucun cours ajouté pour le moment.
                    </p>

                )}


                {/* =================================================
                    LISTE DES COURS
                ================================================= */}

                {!loading &&
                    cours.length > 0 && (

                    <div className="cours-container">

                        {cours.map((coursItem) => (

                            <div
                                className="cours-card"
                                key={coursItem.id_cours}
                            >

                                <div className="cours-info">

                                    <h3>
                                        📖 {coursItem.nom}
                                    </h3>

                                    <p>
                                        ID du cours :
                                        {" "}
                                        {coursItem.id_cours}
                                    </p>

                                </div>


                                {/* OUVRIR */}

                                <button
                                    className="open-course-btn"
                                    onClick={() =>
                                        ouvrirCours(
                                            coursItem.nom
                                        )
                                    }
                                >
                                    📖 Ouvrir
                                </button>


                                {/* SUPPRIMER */}

                                <button
                                    className="delete-course-btn"
                                    onClick={() =>
                                        supprimerCours(
                                            coursItem.id_cours
                                        )
                                    }
                                >
                                    🗑️
                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </main>

        </div>

    );

}

export default GestCours;