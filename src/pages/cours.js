import { useEffect, useState } from "react";
import "./cours.css";

function Cours() {

    const [cours, setCours] = useState([]);


    // =====================================================
    // RECUPERER LES COURS
    // =====================================================

    useEffect(() => {

        fetch("http://127.0.0.1:8000/courses")

            .then(response => response.json())

            .then(data => {

                console.log(
                    "Cours disponibles :",
                    data
                );

                setCours(data);

            })

            .catch(error =>
                console.error(
                    "Erreur récupération cours :",
                    error
                )
            );

    }, []);


    // =====================================================
    // OUVRIR PDF
    // =====================================================

    const ouvrirPDF = async (nomPDF) => {

        console.log(
            "Cours sélectionné :",
            nomPDF
        );


        try {

            // =================================================
            // RECUPERER UTILISATEUR CONNECTE
            // =================================================

            const userStorage =
                localStorage.getItem("user");


            if (!userStorage) {

                console.error(
                    "Aucun utilisateur connecté"
                );

                return;

            }


            const user =
                JSON.parse(userStorage);


            console.log(
                "Utilisateur connecté :",
                user.username
            );


            // =================================================
            // AJOUTER LE COURS DANS SUIVRE
            // =================================================

            const response = await fetch(
                "http://localhost:5000/suivre-cours",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        nomCours: nomPDF,

                        username: user.username

                    })

                }
            );


            const data =
                await response.json();


            console.log(
                "Réponse serveur :",
                data
            );


            if (!response.ok) {

                console.error(
                    "Erreur ajout suivre :",
                    data.message
                );

                return;

            }


            // =================================================
            // OUVRIR LE PDF
            // =================================================

            window.open(
                `http://127.0.0.1:8000/pdf/${encodeURIComponent(nomPDF)}`,
                "_blank"
            );


        } catch (error) {

            console.error(
                "Erreur suivre cours :",
                error
            );

        }

    };


    // =====================================================
    // INTERFACE
    // =====================================================

    return (

        <div className="cours-container">

            <h1>
                📚 Cours disponibles
            </h1>


            {cours.map((pdf, index) => (

                <div
                    className="cours-card"
                    key={index}
                >

                    <h3>
                        📘 {pdf.name}
                    </h3>


                    <button
                        onClick={() =>
                            ouvrirPDF(pdf.name)
                        }
                    >
                        📖 Ouvrir
                    </button>

                </div>

            ))}

        </div>

    );

}

export default Cours;