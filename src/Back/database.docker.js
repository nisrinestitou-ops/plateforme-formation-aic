const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.POSTGRES_USER || "postgres",
    host: process.env.POSTGRES_HOST || "postgres",
    database: process.env.POSTGRES_DB || "formation_db",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    port: Number(process.env.POSTGRES_PORT) || 5432
});

module.exports = pool;