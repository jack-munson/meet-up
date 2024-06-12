const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
})

const createMeeting = async (userId, title, description, startTime, endTime, invites, recurring) => {
    const client = await pool.connect()
    
    try {
        const meetingQuery = `
            INSERT INTO meetings (user_id, title, description, start_time, end_time, invites, recurring)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING user_id, title, id
        `
        const meetingValues = [userId, title, description, startTime, endTime, invites, recurring]
        const meetingResult = await client.query(meetingQuery, meetingValues)
        const newMeeting =  meetingResult.rows[0]

        const userQuery = `
            UPDATE users
            SET user_meetings = array_append(COALESCE(user_meetings, '{}'), $1)
            WHERE user_id = $2
            RETURNING user_meetings;
        `
        const userValues = [newMeeting.id, userId]
        const userResult = await client.query(userQuery, userValues)

        return { newMeeting, userMeetings: userResult.rows[0].user_meetings }
    } catch (error) {
        console.error("Error in createMeeting function:", error)
    } finally {
        client.release()
    }
}

const createUser = async (userId, firstName, lastName, email) => {
    const client = await pool.connect()

    try {
        const query = `
            INSERT INTO users (user_id, first_name, last_name, email)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, first_name, last_name, email
        `
        const values = [userId, firstName, lastName, email]
        const result = await client.query(query, values)
        return result.rows[0]
    } finally {
        client.release()
    }
};

const getMeetingsByUserId = async (userId) => {
    const client = await pool.connect()

    try {
        const query = `
            SELECT * FROM meetings
            WHERE user_id = $1
        `
        const values = [userId]
        const result = await client.query(query, values)
        return result.rows
    } finally {
        client.release()
    }
}

const addInvite = async (meetingId, newInvite) => {
    const client = await pool.connect()

    try {
        const query = `
            UPDATE meetings
            SET invites = array_append(invites, $2)
            WHERE id = $1
            RETURNING invites
        `
        const values = [meetingId, newInvite]
        const result = await client.query(query, values)
        return result
    } finally {
        client.release()
    }
}

module.exports = {
    createMeeting, createUser, getMeetingsByUserId, addInvite
};
