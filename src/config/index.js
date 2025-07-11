// const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'plm_admin',
//   host: 'localhost',
//   database: 'PLM',
//   password: 'plm123',
//   port: 5432
// });

// module.exports = pool;


const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Only needed if connecting to remote PostgreSQL with SSL (e.g., Render)
  }
});

module.exports = pool;
