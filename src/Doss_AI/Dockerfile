FROM python:3.11-slim

WORKDIR /app

COPY src/Doss_AI/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY src/Doss_AI .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]