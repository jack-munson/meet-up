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

router.post('/create-user', async (req, res) => {
    try {
        const { userId, firstName, lastName, email } = req.body;

        const user = await db.createUser(userId, firstName, lastName, email);

        res.status(201).json({ message: 'User created successfully: ', userId: user.user_id, firstName: user.first_name, lastName: user.last_name, email: user.email });
    } catch(error) {
        console.error('Error creating user (Routes.js): ', error);
        res.status(500).json({ error: 'Internal server error'});
    }
})

module.exports = router;

// curl -X POST http://localhost:3000/api/create-user \
//      -H "Content-Type: application/json" \
//      -d '{
//            "userId": "testid123",
//            "firstName": "John",
//            "lastName": "Doe",
//            "email": "john.doe@example.com"
//          }'