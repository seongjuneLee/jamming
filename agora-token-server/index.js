require('dotenv').config();
const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const PORT = process.env.PORT || 8080;
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

const app = express();

const generateRTCToken = (req, resp) => {
    resp.header('Access-Control-Allow-Origin', '*');
    // get channel name
    const channelName = req.params.channelName;
    if (!channelName) {
        return resp.status(500).json({ 'error': 'channel is required' });
    }
    // get uid 
    let uid = req.params.uid;
    if(!uid || uid == '') {
        uid = 0;
    }
    // get role
    let role = RtcRole.SUBSCRIBER;
    if (req.params.role == 'publisher') {
        role = RtcRole.PUBLISHER;
    }
    // get the expire time
    let expireTime = req.query.expireTime;
    if (!expireTime || expireTime == '') {
        expireTime = 3600; 
    } else {
        expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    // build the token
    const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);

    // return the token
    return resp.json({ 'rtcToken': token });
};

app.get('/rtc/:channelName/:role/:uid', generateRTCToken);

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
}); 