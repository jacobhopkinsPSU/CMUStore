const pug = require('pug');
const path = require('path');

const sendMail = require('./mailer');

const createEmail = (email, name, token) => {
  sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: 'User Verification',
    html: pug.renderFile(path.join(__dirname, '../views/email.pug'), {
      user: name,
      url: `${process.env.NODEMAILER_URL}/users/verify/${token}`,
    }),
  });
};

module.exports = createEmail;
