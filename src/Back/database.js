const { Pool } = require("pg");


const pool = new Pool({

    user: "postgres",
    host: "localhost",
    database: "formation_db",
    password: "200318110",
    port: 5432

});


module.exports = pool;