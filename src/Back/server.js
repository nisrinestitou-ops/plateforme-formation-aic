const express = require("express");
const cors = require("cors");
const db = require("./database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());


// =====================================================
// TEST SERVEUR
// =====================================================

app.get("/", (req, res) => {

    res.json({
        message: "API Formation fonctionne"
    });

});


// =====================================================
// TEST DATABASE
// =====================================================

app.get("/test-db", async (req, res) => {

    try {

        const result = await db.query("SELECT NOW()");

        res.json({
            message: "Connexion PostgreSQL réussie",
            date: result.rows[0]
        });

    } catch (error) {

        console.error("ERREUR POSTGRESQL :", error);

        res.status(500).json({
            message: "Erreur PostgreSQL",
            error: error.message
        });

    }

});


// =====================================================
// LOGIN
// =====================================================

app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    try {

        const result = await db.query(
            "SELECT * FROM users WHERE email=$1 AND password=$2",
            [email, password]
        );

        if (result.rows.length === 0) {

            return res.status(401).json({
                message: "Utilisateur incorrect"
            });

        }

        res.json({
            message: "Connexion réussie",
            user: result.rows[0]
        });

    } catch (error) {

        console.error("ERREUR LOGIN :", error);

        res.status(500).json({
            error: error.message
        });

    }

});


// =====================================================
// DOSSIER DES DOCUMENTS
// =====================================================

const dossierDocs = path.join(
    __dirname,
    "..",
    "Doss_AI",
    "Docs"
);


// =====================================================
// CREER LE DOSSIER DOCS
// =====================================================

if (!fs.existsSync(dossierDocs)) {

    fs.mkdirSync(dossierDocs, {
        recursive: true
    });

    console.log("Dossier Docs créé :");
    console.log(dossierDocs);

}


// =====================================================
// CONFIGURATION MULTER
// =====================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, dossierDocs);

    },

    filename: function (req, file, cb) {

        cb(null, file.originalname);

    }

});


const upload = multer({
    storage: storage
});


// =====================================================
// ANCIEN UPLOAD - CONSERVE
// =====================================================

app.post(
    "/upload-cours",
    upload.single("document"),
    (req, res) => {

        if (!req.file) {

            return res.status(400).json({
                message: "Aucun document sélectionné"
            });

        }

        console.log(
            "Cours ajouté :",
            req.file.originalname
        );

        res.json({

            message: "Document ajouté avec succès",

            fichier: req.file.filename

        });

    }
);


// =====================================================
// AJOUTER UN COURS
// =====================================================

app.post(
    "/ajouter-cours",
    upload.single("document"),
    async (req, res) => {

        console.log("--------------------------------");
        console.log("REQUETE AJOUT COURS");
        console.log("--------------------------------");


        if (!req.file) {

            return res.status(400).json({
                message: "Aucun document sélectionné"
            });

        }


        const nom_formateur = req.body.nom_formateur;

        console.log(
            "Nom formateur reçu :",
            nom_formateur
        );


        if (!nom_formateur) {

            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
                message: "Nom du formateur manquant"
            });

        }


        try {

            const formateurResult = await db.query(
                "SELECT id_formateur FROM formateur WHERE nom = $1",
                [nom_formateur]
            );


            console.log(
                "Formateur trouvé :",
                formateurResult.rows
            );


            if (formateurResult.rows.length === 0) {

                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(404).json({
                    message: "Formateur introuvable"
                });

            }


            const id_formateur =
                formateurResult.rows[0].id_formateur;


            let id_cours;
            let existe = true;


            while (existe) {

                id_cours = Math.floor(
                    100000 +
                    Math.random() * 900000
                );


                const verification = await db.query(
                    "SELECT id_cours FROM cours WHERE id_cours = $1",
                    [id_cours]
                );


                existe =
                    verification.rows.length > 0;

            }


            console.log(
                "ID cours généré :",
                id_cours
            );


            const nom =
                path.parse(
                    req.file.originalname
                ).name;


            console.log(
                "Nom du cours :",
                nom
            );


            console.log(
                "ID formateur :",
                id_formateur
            );


            const result = await db.query(
                `
                INSERT INTO cours
                (
                    id_cours,
                    nom,
                    id_formateur
                )
                VALUES
                (
                    $1,
                    $2,
                    $3
                )
                RETURNING *
                `,
                [
                    id_cours,
                    nom,
                    id_formateur
                ]
            );


            console.log(
                "COURS AJOUTE :",
                result.rows[0]
            );


            res.json({

                message: "✅ Cours ajouté avec succès",

                cours: result.rows[0]

            });


        } catch (error) {

            console.error(
                "ERREUR AJOUT COURS :",
                error
            );


            if (
                req.file &&
                fs.existsSync(req.file.path)
            ) {

                fs.unlinkSync(
                    req.file.path
                );

            }


            res.status(500).json({

                message: "Erreur serveur",

                error: error.message

            });

        }

    }
);


// =====================================================
// MES COURS
// =====================================================

app.get("/mes-cours", async (req, res) => {

    const { nom } = req.query;


    console.log("--------------------------------");
    console.log("Requête /mes-cours");
    console.log("Nom reçu :", nom);
    console.log("--------------------------------");


    if (!nom) {

        return res.status(400).json({
            message: "Nom du formateur manquant"
        });

    }


    try {

        const formateurResult = await db.query(
            "SELECT id_formateur FROM formateur WHERE nom = $1",
            [nom]
        );


        console.log(
            "Formateur trouvé :",
            formateurResult.rows
        );


        if (formateurResult.rows.length === 0) {

            return res.status(404).json({
                message: "Formateur introuvable"
            });

        }


        const id_formateur =
            formateurResult.rows[0].id_formateur;


        const coursResult = await db.query(
            "SELECT * FROM cours WHERE id_formateur = $1",
            [id_formateur]
        );


        console.log(
            "Cours trouvés :",
            coursResult.rows
        );


        res.json(
            coursResult.rows
        );


    } catch (error) {

        console.error(
            "ERREUR DATABASE :",
            error
        );


        res.status(500).json({

            message: "Erreur serveur",

            error: error.message

        });

    }

});


// =====================================================
// NOMBRE DE COURS DU FORMATEUR
// =====================================================

app.get("/nombre-cours", async (req, res) => {

    const { nom } = req.query;

    console.log("--------------------------------");
    console.log("Requête /nombre-cours");
    console.log("Nom reçu :", nom);
    console.log("--------------------------------");


    if (!nom) {

        return res.status(400).json({
            message: "Nom du formateur manquant"
        });

    }


    try {

        const formateurResult = await db.query(
            "SELECT id_formateur FROM formateur WHERE nom = $1",
            [nom]
        );


        console.log(
            "Formateur trouvé :",
            formateurResult.rows
        );


        if (formateurResult.rows.length === 0) {

            return res.status(404).json({
                message: "Formateur introuvable"
            });

        }


        const id_formateur =
            formateurResult.rows[0].id_formateur;


        console.log(
            "ID formateur :",
            id_formateur
        );


        const countResult = await db.query(
            `
            SELECT COUNT(*) AS nombre
            FROM cours
            WHERE id_formateur = $1
            `,
            [id_formateur]
        );


        const nombre =
            parseInt(
                countResult.rows[0].nombre,
                10
            );


        console.log(
            "Nombre de cours :",
            nombre
        );


        res.json({
            nombre: nombre
        });


    } catch (error) {

        console.error(
            "ERREUR COMPTEUR COURS :",
            error
        );


        res.status(500).json({

            message: "Erreur serveur",

            error: error.message

        });

    }

});


// =====================================================
// MES STAGIAIRES
// =====================================================

app.get("/mes-stagiaires", async (req, res) => {

    const { nom } = req.query;


    console.log("--------------------------------");
    console.log("Requête /mes-stagiaires");
    console.log("Nom reçu :", nom);
    console.log("--------------------------------");


    if (!nom) {

        return res.status(400).json({
            message: "Nom du formateur manquant"
        });

    }


    try {

        // =================================================
        // CHERCHER LE FORMATEUR
        // =================================================

        const formateurResult = await db.query(
            "SELECT id_formateur FROM formateur WHERE nom = $1",
            [nom]
        );


        console.log(
            "Formateur trouvé :",
            formateurResult.rows
        );


        if (formateurResult.rows.length === 0) {

            return res.status(404).json({
                message: "Formateur introuvable"
            });

        }


        const id_formateur =
            formateurResult.rows[0].id_formateur;


        console.log(
            "ID formateur :",
            id_formateur
        );


        // =================================================
        // CHERCHER LES STAGIAIRES
        // AVEC NOMBRE DE COURS ET EXAMENS
        // =================================================

        const stagiairesResult = await db.query(
            `
            SELECT
                u.id,
                u.username,
                u.email,

                (
                    SELECT COUNT(*)
                    FROM suivre s
                    WHERE s.id = u.id
                ) AS nombre_cours,

                (
                    SELECT COUNT(*)
                    FROM examen e
                    WHERE e.id_user = u.id
                ) AS nombre_examens

            FROM users u

            WHERE u.id_formateur = $1
            AND u.role = 'stageaire'

            ORDER BY u.id
            `,
            [id_formateur]
        );


        console.log(
            "Stagiaires trouvés :",
            stagiairesResult.rows
        );


        // =================================================
        // REPONSE
        // =================================================

        res.json(
            stagiairesResult.rows
        );


    } catch (error) {

        console.error(
            "ERREUR DATABASE STAGIAIRES :",
            error
        );


        res.status(500).json({

            message: "Erreur serveur",

            error: error.message

        });

    }

});


// =====================================================
// AJOUTER UN STAGIAIRE
// =====================================================

app.post("/ajouter-stagiaire", async (req, res) => {

    console.log("--------------------------------");
    console.log("REQUETE AJOUT STAGIAIRE");
    console.log("--------------------------------");

    const {
        username,
        email,
        nom_formateur
    } = req.body;


    if (!username || !email || !nom_formateur) {

        return res.status(400).json({
            message: "Username, email et nom du formateur sont obligatoires"
        });

    }


    try {

        const formateurResult = await db.query(
            "SELECT id_formateur FROM formateur WHERE nom = $1",
            [nom_formateur]
        );


        console.log(
            "Formateur trouvé :",
            formateurResult.rows
        );


        if (formateurResult.rows.length === 0) {

            return res.status(404).json({
                message: "Formateur introuvable"
            });

        }


        const id_formateur =
            formateurResult.rows[0].id_formateur;


        console.log(
            "ID formateur :",
            id_formateur
        );


        let id;
        let existeId = true;


        while (existeId) {

            id = Math.floor(
                100000 +
                Math.random() * 900000
            );


            const verification = await db.query(
                "SELECT id FROM users WHERE id = $1",
                [id]
            );


            existeId =
                verification.rows.length > 0;

        }


        console.log(
            "ID stagiaire généré :",
            id
        );


        const password =
            Math.random()
                .toString(36)
                .slice(-8);


        console.log(
            "Password généré :",
            password
        );


        const emailVerification = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );


        if (emailVerification.rows.length > 0) {

            return res.status(409).json({
                message: "Cet email existe déjà"
            });

        }


        const result = await db.query(
            `
            INSERT INTO users
            (
                id,
                username,
                email,
                password,
                role,
                id_formateur
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )
            RETURNING id, username, email, password, role, id_formateur
            `,
            [
                id,
                username,
                email,
                password,
                "stageaire",
                id_formateur
            ]
        );


        console.log(
            "STAGIAIRE AJOUTE :",
            result.rows[0]
        );


        res.json({

            message: "Stagiaire ajouté avec succès",

            stagiaire: result.rows[0]

        });


    } catch (error) {

        console.error(
            "ERREUR AJOUT STAGIAIRE :",
            error
        );


        res.status(500).json({

            message: "Erreur serveur",

            error: error.message

        });

    }

});


// =====================================================
// NOMBRE DE STAGIAIRES DU FORMATEUR
// =====================================================

app.get("/nombre-stagiaires", async (req, res) => {

    const { nom } = req.query;

    console.log("--------------------------------");
    console.log("Requête /nombre-stagiaires");
    console.log("Nom reçu :", nom);
    console.log("--------------------------------");


    if (!nom) {

        return res.status(400).json({
            message: "Nom du formateur manquant"
        });

    }


    try {

        const formateurResult = await db.query(
            "SELECT id_formateur FROM formateur WHERE nom = $1",
            [nom]
        );


        console.log(
            "Formateur trouvé :",
            formateurResult.rows
        );


        if (formateurResult.rows.length === 0) {

            return res.status(404).json({
                message: "Formateur introuvable"
            });

        }


        const id_formateur =
            formateurResult.rows[0].id_formateur;


        console.log(
            "ID formateur :",
            id_formateur
        );


        const countResult = await db.query(
            `
            SELECT COUNT(*) AS nombre
            FROM users
            WHERE id_formateur = $1
            AND role = 'stageaire'
            `,
            [id_formateur]
        );


        const nombre =
            parseInt(
                countResult.rows[0].nombre,
                10
            );


        console.log(
            "Nombre de stagiaires :",
            nombre
        );


        res.json({
            nombre: nombre
        });


    } catch (error) {

        console.error(
            "ERREUR COMPTEUR STAGIAIRES :",
            error
        );


        res.status(500).json({

            message: "Erreur serveur",

            error: error.message

        });

    }

});


// =====================================================
// SUPPRIMER UN STAGIAIRE
// =====================================================

app.delete("/supprimer-stagiaire/:id", async (req, res) => {

    const id = req.params.id;

    console.log("--------------------------------");
    console.log("SUPPRESSION STAGIAIRE");
    console.log("ID reçu :", id);
    console.log("--------------------------------");


    try {

        // =================================================
        // SUPPRIMER DANS PASSER
        // =================================================

        await db.query(
            "DELETE FROM passer WHERE id = $1",
            [id]
        );


        console.log(
            "Stagiaire supprimé de passer"
        );


        // =================================================
        // SUPPRIMER DANS SUIVRE
        // =================================================

        await db.query(
            "DELETE FROM suivre WHERE id = $1",
            [id]
        );


        console.log(
            "Stagiaire supprimé de suivre"
        );


        // =================================================
        // SUPPRIMER DANS USERS
        // =================================================

        const result = await db.query(
            "DELETE FROM users WHERE id = $1 RETURNING *",
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Stagiaire introuvable"
            });

        }


        console.log(
            "Stagiaire supprimé de users :",
            result.rows[0]
        );


        res.json({

            message: "Stagiaire supprimé avec succès",

            stagiaire: result.rows[0]

        });


    } catch (error) {

        console.error(
            "ERREUR SUPPRESSION STAGIAIRE :",
            error
        );


        res.status(500).json({

            message: "Erreur serveur",

            error: error.message

        });

    }

});


// =====================================================
// SUPPRIMER UN COURS
// =====================================================

app.delete("/supprimer-cours/:id", async (req, res) => {

    const id_cours = req.params.id;

    console.log("--------------------------------");
    console.log("SUPPRESSION COURS");
    console.log("ID reçu :", id_cours);
    console.log("--------------------------------");


    try {

        const result = await db.query(
            "DELETE FROM cours WHERE id_cours = $1 RETURNING *",
            [id_cours]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Cours introuvable"
            });

        }


        console.log(
            "Cours supprimé :",
            result.rows[0]
        );


        res.json({

            message: "Cours supprimé avec succès",

            cours: result.rows[0]

        });


    } catch (error) {

        console.error(
            "ERREUR SUPPRESSION COURS :",
            error
        );


        res.status(500).json({

            message: "Erreur serveur",

            error: error.message

        });

    }

});


// =====================================================
// SUIVRE UN COURS
// =====================================================

app.post("/suivre-cours", async (req, res) => {

    const { nomCours, username } = req.body;

    console.log("--------------------------------");
    console.log("REQUETE /suivre-cours");
    console.log("Nom cours reçu :", nomCours);
    console.log("Username reçu :", username);
    console.log("--------------------------------");


    if (!nomCours || !username) {

        return res.status(400).json({
            message: "Nom du cours et username obligatoires"
        });

    }


    try {

        const nomCoursSansExtension =
            path.parse(nomCours).name;


        console.log(
            "Nom cours sans extension :",
            nomCoursSansExtension
        );


        const coursResult = await db.query(
            `
            SELECT id_cours
            FROM cours
            WHERE nom = $1
            `,
            [nomCoursSansExtension]
        );


        console.log(
            "Cours trouvé :",
            coursResult.rows
        );


        if (coursResult.rows.length === 0) {

            return res.status(404).json({
                message: "Cours introuvable dans la base de données"
            });

        }


        const id_cours =
            coursResult.rows[0].id_cours;


        console.log(
            "ID cours :",
            id_cours
        );


        const userResult = await db.query(
            `
            SELECT id
            FROM users
            WHERE username = $1
            `,
            [username]
        );


        console.log(
            "Utilisateur trouvé :",
            userResult.rows
        );


        if (userResult.rows.length === 0) {

            return res.status(404).json({
                message: "Utilisateur introuvable"
            });

        }


        const id =
            userResult.rows[0].id;


        console.log(
            "ID utilisateur :",
            id
        );


        const dejaSuivi = await db.query(
            `
            SELECT *
            FROM suivre
            WHERE id = $1
            AND id_cours = $2
            `,
            [
                id,
                id_cours
            ]
        );


        if (dejaSuivi.rows.length > 0) {

            console.log(
                "Cours déjà présent dans suivre"
            );


            return res.json({

                message: "Cours déjà suivi",

                id: id,

                id_cours: id_cours

            });

        }


        const suivreResult = await db.query(
            `
            INSERT INTO suivre
            (
                id,
                id_cours
            )
            VALUES
            (
                $1,
                $2
            )
            RETURNING *
            `,
            [
                id,
                id_cours
            ]
        );


        console.log(
            "INSERTION SUIVRE :",
            suivreResult.rows[0]
        );


        res.json({

            message: "Cours ajouté dans suivre avec succès",

            id: id,

            id_cours: id_cours,

            suivre: suivreResult.rows[0]

        });


    } catch (error) {

        console.error(
            "ERREUR SUIVRE COURS :",
            error
        );


        res.status(500).json({

            message: "Erreur lors de l'ajout du cours dans suivre",

            error: error.message

        });

    }

});


// =====================================================
// CREER UN EXAMEN
// =====================================================

app.post("/creer-examen", async (req, res) => {

    const {
        id,
        degre
    } = req.body;


    console.log("--------------------------------");
    console.log("REQUETE CREATION EXAMEN");
    console.log("ID utilisateur :", id);
    console.log("Degré :", degre);
    console.log("--------------------------------");


    if (!id || !degre) {

        return res.status(400).json({

            message:
                "ID utilisateur et degré obligatoires"

        });

    }


    const degresAutorises = [
        "facile",
        "moyen",
        "difficile"
    ];


    if (!degresAutorises.includes(degre)) {

        return res.status(400).json({

            message:
                "Degré invalide. Utilisez facile, moyen ou difficile."

        });

    }


    try {

        const userResult = await db.query(

            `
            SELECT id
            FROM users
            WHERE id = $1
            `,

            [id]

        );


        if (userResult.rows.length === 0) {

            return res.status(404).json({

                message:
                    "Utilisateur introuvable"

            });

        }


        console.log(
            "Utilisateur trouvé :",
            userResult.rows[0]
        );


        let id_ex;
        let existe = true;


        while (existe) {

            id_ex = Math.floor(
                100000 +
                Math.random() * 900000
            );


            const verification = await db.query(

                `
                SELECT id_ex
                FROM examen
                WHERE id_ex = $1
                `,

                [id_ex]

            );


            existe =
                verification.rows.length > 0;

        }


        console.log(
            "ID examen généré :",
            id_ex
        );


        const examenResult = await db.query(

            `
            INSERT INTO examen
            (
                id_ex,
                degre,
                id_user
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            RETURNING *
            `,

            [
                id_ex,
                degre,
                id
            ]

        );


        console.log(
            "EXAMEN CREE :",
            examenResult.rows[0]
        );


        res.status(201).json({

            message:
                "Examen créé avec succès",

            examen:
                examenResult.rows[0]

        });


    } catch (error) {

        console.error(
            "ERREUR CREATION EXAMEN :",
            error
        );


        res.status(500).json({

            message:
                "Erreur lors de la création de l'examen",

            error:
                error.message

        });

    }

});

// =====================================================
// DASHBOARD STAGIAIRE
// =====================================================

app.get("/dashboard-stagiaire/:id", async (req, res) => {

    const id = req.params.id;

    console.log("=================================");
    console.log("DASHBOARD STAGIAIRE");
    console.log("ID stagiaire :", id);
    console.log("=================================");

    try {

        // =================================================
        // VERIFIER LE STAGIAIRE
        // =================================================

        const userResult = await db.query(
            `
            SELECT id, username, email, role
            FROM users
            WHERE id = $1
            `,
            [id]
        );


        if (userResult.rows.length === 0) {

            return res.status(404).json({
                message: "Stagiaire introuvable"
            });

        }


        // =================================================
        // TOTAL FIXE
        // =================================================

        const nombreCoursTotal = 5;

        const nombreExamensTotal =3;


        // =================================================
        // NOMBRE DE COURS SUIVIS
        // =================================================

        const coursSuivisResult = await db.query(
            `
            SELECT COUNT(*) AS nombre
            FROM suivre
            WHERE id = $1
            `,
            [id]
        );


        const nombreCoursSuivis =
            parseInt(
                coursSuivisResult.rows[0].nombre,
                10
            );


        // =================================================
        // NOMBRE D'EXAMENS REALISES
        // =================================================

        const examensRealisesResult = await db.query(
            `
            SELECT COUNT(*) AS nombre
            FROM examen
            WHERE id_user = $1
            `,
            [id]
        );


        const nombreExamensRealises =
            parseInt(
                examensRealisesResult.rows[0].nombre,
                10
            );


        // =================================================
        // PROGRESSION COURS
        // =================================================

        const progressionCours =
            Math.round(
                (nombreCoursSuivis / nombreCoursTotal) * 100
            );


        // =================================================
        // PROGRESSION EXAMENS
        // =================================================

        const progressionExamens =
            Math.round(
                (nombreExamensRealises / nombreExamensTotal) * 100
            );


        // =================================================
        // REPONSE
        // =================================================

        const dashboard = {

            stagiaire: userResult.rows[0],

            cours: {

                total: nombreCoursTotal,

                suivis: nombreCoursSuivis,

                progression: progressionCours

            },

            examens: {

                total: nombreExamensTotal,

                realises: nombreExamensRealises,

                progression: progressionExamens

            }

        };


        console.log(
            "Dashboard :",
            dashboard
        );


        res.status(200).json(dashboard);


    } catch (error) {

        console.error(
            "ERREUR DASHBOARD :",
            error
        );


        res.status(500).json({

            message: "Erreur serveur dashboard",

            error: error.message

        });

    }

});
// =====================================================
// DEMARRAGE DU SERVEUR
// =====================================================

app.listen(5000, () => {

    console.log("=================================");
    console.log("Serveur Node démarré");
    console.log("Port : 5000");
    console.log("http://localhost:5000");
    console.log("=================================");

});