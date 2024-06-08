const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

const createMeeting = async (userId, title, description, startTime, endTime, invites, recurring) => {
    const client = await pool.connect();
    
    try {
        const query = `
            INSERT INTO meetings (user_id, title, description, start_time, end_time, invites, recurring)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING user_id, title, id
        `;
        const values = [userId, title, description, startTime, endTime, invites, recurring];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

module.exports = {
    createMeeting
};
