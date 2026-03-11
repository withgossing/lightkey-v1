require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const SSO_AUTHORIZE_URL = process.env.SSO_AUTHORIZE_URL || 'http://localhost:18002/api/oauth/authorize';
const SSO_TOKEN_URL = process.env.SSO_TOKEN_URL || 'http://localhost:18002/api/oauth/token';
const CLIENT_ID = process.env.CLIENT_ID || 'dummy_client_id_here'; // Replace with admin-generated ID
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'dummy_scret_here'; // Replace with secret
const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${PORT}/callback`;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory session store for dummy app
const sessions = {};

app.get('/', (req, res) => {
    const sessionId = req.headers.cookie ? req.headers.cookie.split('=')[1] : null;
    const user = sessions[sessionId];

    if (user) {
        res.render('index', { user });
    } else {
        res.render('index', { user: null });
    }
});

app.get('/login', (req, res) => {
    // Redirect user to Lightkey SSO for authentication
    const state = Math.random().toString(36).substring(7);
    const authUrl = `${SSO_AUTHORIZE_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const { code, state, error, error_description } = req.query;

    if (error) {
        return res.status(400).send(`SSO Error: ${error} - ${error_description}`);
    }

    if (!code) {
        return res.status(400).send('Authorization code is missing');
    }

    try {
        // Exchange code for tokens via Server-to-Server M2M mapping
        const response = await axios.post(SSO_TOKEN_URL, {
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            redirect_uri: REDIRECT_URI
        });

        const { access_token, id_token } = response.data;
        
        // Simple mock decoding for demonstration. Real apps should properly verify the JWT signature.
        const payloadBase64 = access_token.split('.')[1];
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));

        // Save session locally
        const sessionId = Math.random().toString(36).substring(2);
        sessions[sessionId] = {
            userId: payload.sub,
            accessToken: access_token,
            rawPayload: payload
        };

        res.cookie('app_session', sessionId, { httpOnly: true });
        res.redirect('/');
    } catch (err) {
        console.error('Error exchanging token:', err.response?.data || err.message);
        res.status(500).send('Failed to exchange authorization code for an access token.');
    }
});

app.get('/logout', (req, res) => {
    const sessionId = req.headers.cookie ? req.headers.cookie.split('=')[1] : null;
    if (sessionId) {
        delete sessions[sessionId];
    }
    res.clearCookie('app_session');
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Test SP Client running on http://localhost:${PORT}`);
    console.log(`Before testing, create a Service Provider on Lightkey Admin page`);
    console.log(`and set CLIENT_ID and CLIENT_SECRET in an .env file.`);
});
