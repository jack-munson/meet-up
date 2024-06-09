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
        const meetingQuery = `
            INSERT INTO meetings (user_id, title, description, start_time, end_time, invites, recurring)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING user_id, title, id
        `;
        const meetingValues = [userId, title, description, startTime, endTime, invites, recurring];
        const meetingResult = await client.query(meetingQuery, meetingValues);
        const newMeetingId =  meetingResult.rows[0].id;

        const userQuery = `
            UPDATE users
            SET user_meetings = array_append(COALESCE(user_meetings, '{}'), $1)
            WHERE user_id = $2
            RETURNING user_meetings;
        `;
        const userValues = [newMeetingId, userId];
        const userResult = await client.query(userQuery, userValues)

        return userResult.rows[0];
    } catch (error) {
        console.error("Error in createMeeting function:", error);
        throw error; // Rethrow the error after logging it
    } finally {
        client.release();
    }
};

const createUser = async (userId, firstName, lastName, email) => {
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO users (user_id, first_name, last_name, email)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, first_name, last_name, email
        `;
        const values = [userId, firstName, lastName, email];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

module.exports = {
    createMeeting, createUser
};
