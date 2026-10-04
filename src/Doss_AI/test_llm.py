from search import search
from llm import generate_answer


question = input("Votre question : ")

context = search(question)

answer = generate_answer(question, context)

print("\n========== Réponse ==========\n")
print(answer)