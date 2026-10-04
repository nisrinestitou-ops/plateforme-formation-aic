import { useState } from "react";
import "./Chat.css";

function Chat() {

    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);

    const envoyerMessage = async () => {

        if (prompt.trim() === "") return;

        // Sauvegarder la question avant de vider l'input
        const question = prompt;

        // Message utilisateur
        const userMessage = {
            sender: "user",
            text: question
        };

        // Afficher immédiatement la question
        setMessages((prev) => [...prev, userMessage]);

        // Vider le champ de saisie
        setPrompt("");

        try {

            // Envoi de la question à FastAPI
            const response = await fetch("http://127.0.0.1:8000/chat", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question
                })

            });

            const data = await response.json();

            // Réponse de l'IA
            const aiMessage = {
                sender: "ai",
                text: data.answer
            };

            // Ajouter la réponse
            setMessages((prev) => [...prev, aiMessage]);

        }
        catch (error) {

            const aiMessage = {
                sender: "ai",
                text: "Impossible de contacter le serveur IA."
            };

            setMessages((prev) => [...prev, aiMessage]);

        }

    };

    return (

        <div className="chat-container">

            <h2>Quel est le programme aujourd’hui ?</h2>

            <div className="chat-box">

                {messages.map((msg, index) => (

                    <div
                        key={index}
                        className={
                            msg.sender === "user"
                                ? "user-message"
                                : "ai-message"
                        }
                    >

                        <strong>
                            {msg.sender === "user"
                                ? "Vous :"
                                : "IA :"}
                        </strong>

                        <p>{msg.text}</p>

                    </div>

                ))}

            </div>

            <div className="input-area">

                <input

                    type="text"

                    placeholder="Posez votre question..."

                    value={prompt}

                    onChange={(e) => setPrompt(e.target.value)}

                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            envoyerMessage();
                        }
                    }}

                />

                <button onClick={envoyerMessage}>
                    Envoyer
                </button>

            </div>

        </div>

    );

}

export default Chat;