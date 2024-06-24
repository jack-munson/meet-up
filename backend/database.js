const { Pool } = require('pg')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
})

const createMeeting = async (userId, title, description, startTime, endTime, frequency, days) => {
    const client = await pool.connect()
    
    try {
        const meetingQuery = `
            INSERT INTO meetings (user_id, title, description, start_time, end_time, frequency, days)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING user_id, title, id, description, frequency, days
        `
        const meetingValues = [userId, title, description, startTime, endTime, frequency, days]
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
            WHERE user_id = $1 OR $1 = ANY(accepted)
        `
        const values = [userId]
        const result = await client.query(query, values)
        return result.rows
    } finally {
        client.release()
    }
}

const getMeetingDetails = async (meetingId) => {
    const client = await pool.connect()

    try {
        const query = `
            SELECT * FROM meetings
            WHERE id = $1
        `
        const values = [meetingId]
        const result = await client.query(query, values)
        
        return result.rows[0]
    }
    finally {
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

const createInvite = async (meetingId, email) => {
    const client = await pool.connect()
    const token = uuidv4()
    
    try {
        const query = `
            INSERT INTO invites (token, meeting_id, email)
            VALUES ($1, $2, $3)
        `
        const values = [token, meetingId, email]
        await client.query(query, values)
        return token
    } finally {
        client.release()
    }
}

const validateInvite = async (token) => {
    const client = await pool.connect()
    
    try {
        const query = `
            SELECT * FROM invites
            WHERE token = $1
        `;
        const values = [token]
        const result = await client.query(query, values)
        console.log(result.rows[0])
        return result.rows.length > 0 ? result.rows[0] : null
    } finally {
        client.release()
    }
}

const acceptInvite = async (userId, meetingId) => {
    const client = await pool.connect()

    try {
        const query = `
            UPDATE meetings
            SET accepted = array_append(accepted, $1)
            WHERE id = $2
            RETURNING accepted
        `
        const values = [userId, meetingId]
        const result = await client.query(query, values)
        return result.rows[0]
    } finally {
        client.release()
    }
}

const getMeetingId = async (token) => {
    const client = await pool.connect()

    try {
        const query = `
            SELECT meeting_id FROM invites
            WHERE token = $1
        `
        const values = [token]
        console.log("Token (getMeetingId): ", token)
        const result = await client.query(query, values)
        console.log("getMeetingId in database.js: ", result)
        return result.rows[0]
    } finally {
        client.release()
    }
}

const deleteMeeting = async (meetingId) => {
    const client = await pool.connect()

    try {
        const query = `
            DELETE FROM meetings
            WHERE id = $1
        `
        const values = [meetingId]
        await client.query(query, values)
    } finally {
        client.release()
    }
}

module.exports = {
    createMeeting, createUser, getMeetingsByUserId, addInvite, createInvite, validateInvite, getMeetingDetails, acceptInvite, getMeetingId, deleteMeeting
};
