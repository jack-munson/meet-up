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

const createMeeting = async (userId, title, description, startTime, endTime, frequency, days, accepted) => {
    const client = await pool.connect()
    
    try {
        const meetingQuery = `
            INSERT INTO meetings (user_id, title, description, start_time, end_time, frequency, days, accepted)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING user_id, title, id, description, frequency, days
        `
        const meetingValues = [userId, title, description, startTime, endTime, frequency, days, accepted]
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

const editMeeting = async (id, newTitle, newDescription, newDays, newStartTime, newEndTime) => {
    const client = await pool.connect()

    try {
        const query = `
            UPDATE meetings
                SET title = $2,
                    description = $3,
                    days = $4,
                    start_time = $5,
                    end_time = $6
            WHERE id = $1
            RETURNING title, description, days, start_time, end_time
        `
        const values = [id, newTitle, newDescription, newDays, newStartTime, newEndTime]
        const result = await client.query(query, values)
        const { title, description, days, start_time, end_time } = result.rows[0];

        return { title, description, days, start_time, end_time }
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
            WHERE user_id = $1 OR accepted @> $2::jsonb
        `
        const values = [userId, JSON.stringify({ [userId]: {} })]
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

const getUserName = async(userId) => {
    const client = await pool.connect()

    try {
        const query = `
            SELECT first_name, last_name
            FROM users
            WHERE user_id = $1
        `
        const values = [userId]
        const result = await client.query(query, values)
        console.log("db.js: ", result.rows[0].first_name)
        console.log("AFTER")
        return result.rows[0]
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

const acceptInvite = async (userId, email, name, meetingId) => {
    const client = await pool.connect()

    try {
        const query = `
            UPDATE meetings
            SET accepted = jsonb_set(
                COALESCE(accepted, '{}'::jsonb),
                $1::text[],
                to_jsonb($2::jsonb)
            )
            WHERE id = $3
            RETURNING accepted
        `;
        const path = `{${userId}}`
        const info = { email: email, name: name }
        const values = [path, info, meetingId];
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

const updateAvailability = async (meetingId, userId, newAvailability) => {
    const client = await pool.connect();

    try {
        const query = `
            UPDATE meetings
            SET availability = jsonb_set(
                COALESCE(availability, '{}'::jsonb),
                $2::text[],
                to_jsonb($3::text[])
            )
            WHERE id = $1
            RETURNING availability
        `;
        const path = `{${userId}}`; // Path needs to be constructed as a string
        const values = [meetingId, path, newAvailability];
        const result = await client.query(query, values);
        return result.rows[0].availability;
    } finally {
        client.release();
    }
}

const editMeetingTimes = async (meetingId, newStartTime, newEndTime) => {
    const client = await pool.connect()

    try {
        const query = `
            UPDATE meetings
                SET meeting_start = $2,
                    meeting_end = $3
            WHERE id = $1
            RETURNING meeting_start, meeting_end
        `
        const values = [meetingId, newStartTime, newEndTime]
        const result = await client.query(query, values)
        const { meeting_start, meeting_end } = result.rows[0];

        return { meeting_start, meeting_end }
    } finally {
        client.release()
    }
}

module.exports = {
    createMeeting, editMeeting, createUser, getMeetingsByUserId, addInvite, createInvite, validateInvite, getMeetingDetails, getUserName, acceptInvite, getMeetingId, deleteMeeting, updateAvailability, editMeetingTimes
};
