import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";


function Login() {


    const navigate = useNavigate();


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");



    const handleLogin = async (e) => {


        e.preventDefault();


        try {


            const response = await fetch("http://localhost:5000/login", {


                method: "POST",


                headers: {
                    "Content-Type": "application/json"
                },


                body: JSON.stringify({

                    email: email,
                    password: password

                })


            });



            const data = await response.json();



            if(response.ok){


                // Récupération des informations utilisateur
                const user = data.user;



                // Stockage de l'utilisateur connecté
                localStorage.setItem(
                    "user",
                    JSON.stringify(user)
                );



                // Redirection vers la page accueil
                navigate("/accueil");



            } 
            else {


                // utilisateur incorrect
                setError(data.message);


            }



        } catch(error){


            setError("Impossible de contacter le serveur");


        }


    };




    return (


        <div className="login-page">


            <div className="login-box">



                <h1>
                    Plateforme Formation
                </h1>



                <p className="subtitle">
                    Connexion
                </p>




                <form onSubmit={handleLogin}>


                    <label>
                        Email
                    </label>


                    <input


                        type="email"


                        value={email}


                        onChange={(e)=>setEmail(e.target.value)}


                        placeholder="Entrer votre email"


                        required


                    />





                    <label>
                        Password
                    </label>



                    <input


                        type="password"


                        value={password}


                        onChange={(e)=>setPassword(e.target.value)}


                        placeholder="Entrer votre mot de passe"


                        required


                    />






                    <button type="submit">

                        Se connecter

                    </button>





                    {

                        error && 

                        <p className="error">

                            {error}

                        </p>


                    }





                </form>



            </div>



        </div>



    );



}



export default Login;