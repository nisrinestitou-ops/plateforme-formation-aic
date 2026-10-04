from ollama import chat


def generate_answer(question, context):

    prompt = f"""
Tu es un assistant pédagogique.

Réponds uniquement en utilisant les informations du contexte.

Si la réponse n'existe pas dans le contexte, réponds :

"Je ne trouve pas cette information dans les documents."

Contexte :
{context}

Question :
{question}

Réponse :
"""

    response = chat(
        model="llama3.2",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.message.content