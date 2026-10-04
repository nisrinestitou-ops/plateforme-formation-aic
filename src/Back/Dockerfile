FROM node:22-alpine

WORKDIR /app/Back

COPY src/Back/package.json ./

RUN npm install --omit=dev

COPY src/Back/server.js .
COPY src/Back/database.docker.js ./database.js

COPY src/Doss_AI/Docs /app/Doss_AI/Docs

EXPOSE 5000

CMD ["node", "server.js"]