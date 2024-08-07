const express = require('express')
const axios = require('axios')
const router = express.Router()
const bodyParser = require('body-parser')
const db = require('./database')
require('dotenv').config()
const nodemailer = require('nodemailer')

router.use(bodyParser.json())

router.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

router.post('/create-meeting', async (req, res) => {
    const { userId, title, description, startTime, endTime, frequency, days, accepted } = req.body

    try {
        const result = await db.createMeeting(userId, title, description, startTime, endTime, frequency, days, accepted)
        
        res.status(200).json({ message: 'Meeting created successfully', newMeeting: result.newMeeting, userMeetings: result.userMeetings })
    } catch (error) {
        console.log('Error creating meeting (routes.js):', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/edit-meeting', async (req, res) => {
    const { id, newTitle, newDescription, newDays, newStartTime, newEndTime } = req.body

    try {
        const result = await db.editMeeting(id, newTitle, newDescription, newDays, newStartTime, newEndTime)

        res.status(200).json({ message: 'Meeting edited successfully', newTitle: result.title, newDescription: result.description, newDays: result.days, newStartTime: result.start_time, newEndTime: result.end_time })
    } catch (error) {
        console.log('Error editing meeting (routes.js): ', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/create-user', async (req, res) => {
    const { userId, firstName, lastName, email } = req.body

    try {
        const user = await db.createUser(userId, firstName, lastName, email)
        
        res.status(201).json({ message: 'User created successfully: ', userId: user.user_id, firstName: user.first_name, lastName: user.last_name, email: user.email })
    } catch (error) {
        console.log('Error creating user (Routes.js): ', error)
        res.status(500).json({ error: 'Internal server error'})
    }
})

router.get('/get-meetings', async (req, res) => {
    const { userId } = req.query

    try {
        const meetingInfo = await db.getMeetingsByUserId(userId)

        res.status(200).json({ meetings: meetingInfo.allMeetings, createdIds: meetingInfo.createdMeetings, joinedIds: meetingInfo.joinedMeetings })
    } catch (error) {
        console.log('Error fetching meetings (Routes.js): ', error)
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
        console.log('Error fetching meeting details (Routes.js): ', error)
        res.status(500).json({ error: 'Internal server error '})
    }
})

router.get('/get-user-name', async (req, res) => {
    const { userId } = req.query
    
    try {
        console.log("BEFORE")
        const name = await db.getUserName(userId)
        let firstName = ''
        let lastName = ''
        console.log("NAME: ", name)
        if (name) {
            firstName = name.first_name
            lastName = name.last_name
        }
        
        res.status(200).json({ firstName: firstName, lastName: lastName})
    } catch (error) {
        console.log("ERROR: ", error)
        res.status(500).json({ error: 'Internal server error'})
    }
})

async function sendInviteEmail(email, token, title) {
    const inviteLink = `http://usemeetup.com/invite/${token}`
    const logoURL = 'https://i.imgur.com/34Cfm1U.png'

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.AUTH_USER,
            pass: process.env.AUTH_APP_PASSWORD
        },
    });
  
    const mailOptions = {
      from: process.env.AUTH_USER,
      to: email,
      subject: "You're invited!",
      html: 
        `<html>
            <body style="font-family: Inter, sans-serif; background-color: #f4f4f4; padding: 20px; width: 100%; max-width: 600px; margin: auto; border-radius: 10px;">
                <div style="display:flex;background-color:#1e965c;color:white;padding:10px;border-radius:10px 10px 0 0;justify-content:center;">
                    <img src="${logoURL}" alt="Logo" style="display: block; max-width: 200px;" />
                </div>
                <div style="padding: 20px; background-color: white; border-radius: 0 0 10px 10px;">
                    <p>You have been invited to join</p>
                    <h4>${title}</h4>
                    <p style="margin: 0;">Click on the button below to join:</p>
                    <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; color: white; background-color: #1E965C; text-decoration: none; border-radius: 8px; font-size: 16px; text-align: center;">Join MeetUp</a>
                </div>
            </body>
        </html>`
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending invite email (routes.js): ", error)
    }
}

router.post('/add-invite', async (req, res) => {
    const { meetingId, newInvite, meetingTitle } = req.body

    try {
        await db.addInvite(meetingId, newInvite)
        const token = await db.createInvite(meetingId, newInvite)
        await sendInviteEmail(newInvite, token, meetingTitle)

        res.status(200).json({ message: 'Invite added successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error: ', error })
    }
})

router.get('/invite/:token', async (req, res) => {
    const { token } = req.params;
    
    try {
        const invite = await db.validateInvite(token)
        
        if (invite) {
            res.status(200).json({ message: 'Invite valid', valid: true, token: token })
        }
        else {
            res.status(200).json({ message: 'Invalid invite', valid: false })
        }
    } catch (error) {
        console.error('Error processing invitation: ', error)
        res.status(500).json({ valid: false, message: 'Internal server error' })
    }
})

router.post('/accept-invite', async (req, res) => {
    const { userId, token, email, name } = req.body
    
    try {
        const meeting = await db.getMeetingId(token)
        await db.acceptInvite(userId, email, name, meeting.meeting_id, token)

        res.status(200).json({ message: 'Invite accepted successfully' })
    } catch (error) {
        console.error("Error accepting invite: ", error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.delete('/delete-meeting', async (req, res) => {
    const { meetingId } = req.body

    try {
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
        res.status(500).json({ error: 'Internal server error' })
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
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/create-zoom-meeting', async (req, res) => {
    const { accessToken, meetingDetails } = req.body
    
    try {
        const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', meetingDetails, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        
        res.status(200).json({ message: "Successfully created Zoom meeting", joinURL: response.data.join_url});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/get-user-info', async (req, res) => {
    const { userId } = req.query
    
    try {
        const userInfo = await db.getUserInfo(userId)

        res.status(200).json({ firstName: userInfo.first_name, lastName: userInfo.last_name, email: userInfo.email, meetings: userInfo.user_meetings})
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/change-name', async (req, res) => {
    const { newFirstName, newLastName, userId, meetings } = req.body

    try {
        await db.updateUserName(newFirstName, newLastName, userId, meetings)

        res.status(200).json({ message: "Successfully updated user information"})
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.delete('/delete-account', async (req, res) => {
    const { userId } = req.body

    try {
        await db.deleteAccount(userId)

        res.status(200).json({ message: "Successfully deleted account"})
    } catch (error) {
        console.log("Error deleting account (routes.js): ", error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/add-feedback', async (req, res) => {
    const { name, email, feedback } = req.body

    try {
        await db.addFeedback(name, email, feedback)

        res.status(200).json({ message: "Successfully added feedback"})
    } catch (error) {
        console.log("Error adding feedback (routes.js): ", error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router