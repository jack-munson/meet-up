const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const db = require('./database')

router.use(bodyParser.json())

router.post('/create-meeting', async (req, res) => {
    try {
        const { userId, title, description, startTime, endTime, invites, recurring } = req.body
        
        const result = await db.createMeeting(userId, title, description, startTime, endTime, invites, recurring)
        
        res.status(201).json({ message: 'Meeting created successfully', newMeeting: result.newMeeting, userMeetings: result.userMeetings })
    } catch (error) {
        console.error('Error creating meeting (Routes.js):', error)

        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/create-user', async (req, res) => {
    try {
        const { userId, firstName, lastName, email } = req.body

        const user = await db.createUser(userId, firstName, lastName, email)

        res.status(201).json({ message: 'User created successfully: ', userId: user.user_id, firstName: user.first_name, lastName: user.last_name, email: user.email })
    } catch (error) {
        console.error('Error creating user (Routes.js): ', error)
        res.status(500).json({ error: 'Internal server error'})
    }
})

router.get('/get-meetings', async (req, res) => {
    const { userId } = req.query

    try {
        const meetings = await db.getMeetingsByUserId(userId)

        res.status(200).json({ meetings: meetings })
    } catch (error) {
        console.error('Error fetching meetings (Routes.js): ', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/get-meeting-details', async (req, res) => {
    const { meetingId } = req.query

    try {
        const meeting = await db.getMeetingDetails(meetingId)
        console.log("Meeting (routes.js): ", meeting)
        res.status(200).json({ meeting: meeting})
    } catch (error) {
        console.error('Error fetching meeting details (Routes.js): ', error)
        res.status(500).json({ error: 'Internal server error '})
    }
})

router.post('/add-invite', async (req, res) => {
    try {
        const { meetingId, newInvite} = req.body

        const response = await db.addInvite(meetingId, newInvite)

        res.status(200).json({ message: 'Invite added successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router