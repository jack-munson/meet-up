const express = require('express');
const meetingRoutes = require('./routes');
const nonAPIRoutes = require('./non-api-routes')
const cors = require('cors');

const dev = false;

const app = express();
app.use(cors())

app.use('/api', meetingRoutes);
app.use('/', nonAPIRoutes)

// Start the server
const PORT = dev ? 3000 : 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
