import { google } from "googleapis";
import env from "../../config.js";
export const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_OAUTH_REDIRECT_URL);
const scopes = [
    env.GOOGLE_OAUTH_SCOPES,
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];
oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    // If you only need one scope, you can pass it as a string
    scope: scopes
});
