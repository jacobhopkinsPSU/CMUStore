// TODO: Move to new email provider
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { ErrorHandler } = require('../error');

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

const sendMail = (mailOptions) => {
  smtpTransport.sendMail(mailOptions, (error) => {
    if (error) {
      throw new ErrorHandler(500, 'Unable to send email');
    }
    smtpTransport.close();
  });
};

module.exports = sendMail;
