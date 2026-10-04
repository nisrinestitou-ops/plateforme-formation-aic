const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.json({
        message: "TEST SERVEUR OK"
    });
});

const server = app.listen(5000, () => {
    console.log("=================================");
    console.log("TEST SERVEUR DEMARRE");
    console.log("Port : 5000");
    console.log("=================================");
});

server.on("error", (error) => {
    console.error("ERREUR SERVEUR :", error);
});

process.on("exit", (code) => {
    console.log("NODE VA QUITTER. CODE :", code);
});

process.on("beforeExit", (code) => {
    console.log("NODE beforeExit. CODE :", code);
});