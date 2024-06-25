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

const acceptInvite = async (userId, email, meetingId) => {
    const client = await pool.connect()

    try {
        const query = `
            UPDATE meetings
            SET accepted = array_cat(accepted, ARRAY[$1, $2])
            WHERE id = $3
            RETURNING accepted
        `;
        const values = [userId, email, meetingId];
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

const addAvailability = async (userId, meetingId, day, time) => {
    const client = await pool.connect()

    try {
        const query = `
            UPDATE meetings
            SET availability = COALESCE(availability, '[]'::jsonb) || jsonb_build_array($1::jsonb)
            WHERE id = $2
            RETURNING availability
        `
        const values = [JSON.stringify({ userId, day, time }), meetingId]
        console.log("values (addAvailability): ", values)
        const result = await client.query(query, values)
        console.log("Availability (database.js): ", result.rows[0].availability)

        return result.rows[0].availability
    } finally {
        client.release()
    }
}

const removeAvailability = async (userId, meetingId, day, time) => {
    const client = await pool.connect()

    try {
        const query = `
            UPDATE meetings
            SET availability = (
                SELECT jsonb_agg(elem)
                FROM jsonb_array_elements(availability) AS elem
                WHERE NOT (
                    elem->>'userId' = $1 AND elem->>'day' = $2 AND elem->>'time' = $3
                )
            )
            WHERE id = $4
            RETURNING availability
        `
        const values = [userId, day, time, meetingId]
        const result = await client.query(query, values)

        return result.rows[0]?.availability
    } catch (error) {
        console.error('Error removing availability: ', error)
        throw error
    } finally {
        client.release()
    }
}

const getAvailability = async (userId, meetingId, day, time) => {
    const client = await pool.connect()

    try {
        const query = `
            SELECT availability FROM meetings 
            WHERE id = $1
        `
        const values = [meetingId]
        const { rows } = await client.query(query, values)
        client.release()

        const meeting = rows[0]
        if (!meeting || !meeting.availability) return false
        const availability = meeting.availability

        return availability.some(entry => entry.userId === userId && entry.day === day && entry.time === time)
    } catch (error) {
        throw error
    }
}

module.exports = {
    createMeeting, createUser, getMeetingsByUserId, addInvite, createInvite, validateInvite, getMeetingDetails, acceptInvite, getMeetingId, deleteMeeting, addAvailability, removeAvailability, getAvailability
};
