const express = require('express')
const axios = require('axios')
const router = express.Router()
const bodyParser = require('body-parser')
const db = require('./database')
require('dotenv').config()
const nodemailer = require('nodemailer')
const { last } = require('lodash')

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
        console.log(user)
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
    const { meetingId, token } = req.query

    try {
        let meeting;
        if (meetingId) {
            meeting = await db.getMeetingDetails(meetingId)
        } else if (token) {
            const idFromToken = await db.getMeetingId(token)
            console.log("idFromToken (routes.js): ", idFromToken.meeting_id)
            meeting = await db.getMeetingDetails(idFromToken.meeting_id)
        }
        console.log("Meeting (/get-meeting-details, routes.js): ", meeting)
        res.status(200).json({ meeting: meeting })
    } catch (error) {
        console.error('Error fetching meeting details (Routes.js): ', error)
        res.status(500).json({ error: 'Internal server error '})
    }
})

router.get('/get-user-name', async (req, res) => {
    const { userId } = req.query
    console.log("userId in routes.js: ", userId)
    try {
        const name = await db.getUserName(userId)
        let firstName = ''
        let lastName = ''

        if (name) {
            firstName = name.first_name
            lastName = name.last_name
        }
        res.status(200).json({ firstName: firstName, lastName: lastName})
    } catch (error) {
        res.status(500).json({ error: 'Internal server error'})
    }
})

async function sendInviteEmail(email, token) {
    const inviteLink = `http://localhost:5173/invite/${token}`;
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
      text: `You have been invited to a MeetUp. Click on the link to join: ${inviteLink}`
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
    
    try {
        const invite = await db.validateInvite(token)
        console.log(invite)
        if (invite) {
            res.status(200).json({ message: 'Invite valid', valid: true, token: token })
        }
        else {
            res.status(404).json({ valid: false, message: 'Invalid invite' })
        }
    } catch (error) {
        console.error('Error processing invitation: ', error)
        res.status(500).json({ valid: false, message: 'Internal server error' })
    }
})

router.post('/accept-invite', async (req, res) => {
    const { userId, token, email, name } = req.body
    console.log("userId (routes.js): ", userId)
    console.log("token (routes.js): ", token)
    console.log("email (routes.js): ", email)
    
    try {
        const meeting = await db.getMeetingId(token)
        console.log("Meeting (routes.js): ", meeting)
        await db.acceptInvite(userId, email, name, meeting.meeting_id)

        res.status(200).json({ message: 'Invite accepted successfully' })
    } catch (error) {
        console.error("Error accepting invite: ", error)
        res.status(500).json({ error: 'Internal server error' })
    }
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

router.post('/edit-availability', async (req, res) => {
    const {meetingId, userId, newAvailability} = req.body

    try {
        const result = await db.updateAvailability(meetingId, userId, newAvailability)
        res.status(200).json({ message: "Successfully removed availability", updatedAvailability: result })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error'})
    }
})

router.post('/edit-meeting-time', async (req, res) => {
    const { meetingId, newStartTime, newEndTime } = req.body
    console.log("New start time: ", newStartTime)
    console.log("New end time: ", newEndTime)

    try {
        const result = await db.editMeetingTimes(meetingId, newStartTime, newEndTime)
        console.log("result (routes.js): ", result)
        res.status(200).json({ message: "Successfully edited meeting times", updatedStartTime: result.meeting_start, updatedEndTime: result.meeting_end })
    } catch (error) {
        console.error("Error (routes.js): ", error)
        res.status(500).json({ error: 'Internal server error'})
    }
})

router.post('/create-zoom-meeting', async (req, res) => {
    console.log("Made it to /create-zoom-meeting")
    const { accessToken, meetingDetails } = req.body
    console.log("accessToken (routes.js): ", accessToken)
    console.log("meetingDetails (routes.js): ", meetingDetails)
    try {
        const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', meetingDetails, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        console.log("response.data (routes.js): ", response.data)
        res.status(200).json({ message: "Successfully created Zoom meeting", joinURL: response.data.join_url});
    } catch (error) {
        console.log(error.response ? error.response.data : error.message)
        res.status(500).json({ error: 'Internal server error'});
    }
})

module.exports = router