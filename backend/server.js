const express = require('express');
const meetingRoutes = require('./routes');
const cors = require('cors');

const app = express();
app.use(cors())

// Use the meeting routes
app.use('/api', meetingRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
