import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Accueil from "./pages/Accueil";
import Chat from "./pages/Chat";
import Cours from "./pages/cours";
import Exercices from "./pages/Exercices";
import Examens from "./pages/Examens";
import PasserExamen from "./pages/PasserExamen";
import GestCours from "./pages/GestCours";
import GestStageaires from "./pages/GestStageaires";
import AjouterStagiaire from "./pages/AjouterStagiaire";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />


        <Route
          path="/accueil"
          element={<Accueil />}
        />


        <Route
          path="/chat"
          element={<Chat />}
        />


        <Route
          path="/cours"
          element={<Cours />}
        />


        <Route
          path="/exercices"
          element={<Exercices />}
        />


        <Route
          path="/Examens"
          element={<Examens />}
        />


        <Route
          path="/gest_cours"
          element={<GestCours />}
        />


        <Route
          path="/gest_stageaires"
          element={<GestStageaires />}
        />


        <Route
          path="/ajouter-stagiaire"
          element={<AjouterStagiaire />}
        />


        <Route
          path="/examen/:niveau"
          element={<PasserExamen />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;