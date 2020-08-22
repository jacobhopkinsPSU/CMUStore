const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
  process.env.NODEMAILER_CLIENTID,
  process.env.NODEMAILER_CLIENTSECRET,
  'https://developers.google.com/oauthplayground',
);

oauth2Client.setCredentials({
  refresh_token: process.env.NODEMAILER_REFRESHTOKEN,
});
const accessToken = oauth2Client.getAccessToken;

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.NODEMAILER_EMAIL,
    clientId: process.env.NODEMAILER_CLIENTID,
    clientSecret: process.env.NODEMAILER_CLIENTSECRET,
    refreshToken: process.env.NODEMAILER_REFRESHTOKEN,
    accessToken,
    tls: {
      rejectUnauthorized: false,
    },
  },
});

const mailOptions = {
  from: process.env.NODEMAILER_EMAIL,
  to: 'email@example.com',
  subject: 'Test',
  text: 'Test email',
};

smtpTransport.sendMail(mailOptions, (error, res) => {
  if (error) {
    console.log(error);
  } else {
    console.log(res);
  }
  smtpTransport.close();
});
