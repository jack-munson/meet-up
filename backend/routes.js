const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const db = require('./database')
require('dotenv').config()
const nodemailer = require('nodemailer')

router.use(bodyParser.json())

router.post('/create-meeting', async (req, res) => {
    try {
        const { userId, title, description, startTime, endTime, frequency, days } = req.body
        
        const result = await db.createMeeting(userId, title, description, startTime, endTime, frequency, days)
        
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

async function sendInviteEmail(email, token) {
    const inviteLink = `http://localhost:5176/invite/${token}`;
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.AUTH_USER,
        accessToken: process.env.AUTH_ACCESS_TOKEN
      }
    });
  
    const mailOptions = {
      from: process.env.AUTH_USER,
      to: email,
      subject: 'You are invited!',
      text: `You have been invited to a meeting. Click the link to join: ${inviteLink}`
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending invite email (routes.js): ", error)
    }
}

router.post('/add-invite', async (req, res) => {
    try {
        const { meetingId, newInvite} = req.body

        await db.addInvite(meetingId, newInvite)
        const token = await db.createInvite(meetingId, newInvite)
        await sendInviteEmail(newInvite, token)

        res.status(200).json({ message: 'Invite added successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error: ', error })
    }
})

router.get('/invite/:token', async (req, res) => {
    const { token } = req.params;
    const invite = await db.query('SELECT * FROM Invites WHERE token = $1', [token]);

    if (invite.rows.length === 0) {
        return res.status(404).send('Invalid invite token');
    }

    res.redirect(`/signin?token=${token}`);
})

router.delete('/delete-meeting', async (req, res) => {
    try {
        const { meetingId } = req.body

        await db.deleteMeeting(meetingId)

        res.status(200).json({ message: 'Meeting deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router