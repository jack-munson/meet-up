const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('./database');

router.use(bodyParser.json());

// Route to handle meeting creation
router.post('/create-meeting', async (req, res) => {
    try {
        const { userId, title, description, startTime, endTime, invites, recurring } = req.body;
        console.log('Meeting created with the following information:', { userId, title, description, startTime, endTime, invites, recurring })
        res.status(201).json({ message: 'Meeting created successfully (routes.js)' });
    } catch (error) {
        console.error('Error creating meeting (Routes.js):', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
