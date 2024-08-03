const express = require('express');
const axios = require('axios')
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome to the site!');
});

router.get('/callback', async (req, res) => {
    console.log("Made it to /callback")
    const authorizationCode = req.query.code;
    const originalUrl = req.query.state;
    
    try {
        const response = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                code: authorizationCode,
                redirect_uri: process.env.ZOOM_REDIRECT_URL
            },
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
            }
        });

        const accessToken = response.data.access_token;
        console.log("Access Token:", accessToken);

        const script = `
            <script>
                window.opener.postMessage({ zoomAccessToken: '${accessToken}' }, '${originalUrl}');
                window.close();
            </script>
        `;
        
        // Send the script as the response to the callback request
        res.send(script);
    } catch (error) {
        console.error('Error exchanging authorization code for access token:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;