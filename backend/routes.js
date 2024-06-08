const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('./database');

router.use(bodyParser.json());

// Route to handle meeting creation
router.post('/create-meeting', async (req, res) => {
    try {
        const { userId, title, description, startTime, endTime, invites, recurring } = req.body;

        const result = await db.createMeeting(userId, title, description, startTime, endTime, invites, recurring);

        res.status(201).json({ message: 'Meeting created successfully. meetingId: ', userId: result.user_id, meetingTitle: result.title, meetingId: result.id });
    } catch (error) {
        console.error('Error creating meeting (Routes.js):', error);

        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
