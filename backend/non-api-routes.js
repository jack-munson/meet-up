const express = require('express');
const axios = require('axios')
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome to the site');
});

router.get('/callback', async (req, res) => {
    console.log("Made it to /callback")
    const authorizationCode = req.query.code
    const originalUrl = req.query.state
    
    try {
        const response = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                code: authorizationCode,
                redirect_uri: "https://usemeetup-api.com/callback"
            },
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
            }
        })

        const accessToken = response.data.access_token
        console.log("Access Token:", accessToken)

        const script = `
            <script>
                window.opener.postMessage({ zoomAccessToken: '${accessToken}' }, '${originalUrl}');
                window.close();
            </script>
        `
        
        res.send(script)
    } catch (error) {
        console.log('Error exchanging authorization code for access token:', error)
        res.status(500).send('Internal server error: ' + error + '| Authorization code: ' + authorizationCode + '| Redirect URI: ' + process.env.ZOOM_REDIRECT_URL)
    }
});


module.exports = router