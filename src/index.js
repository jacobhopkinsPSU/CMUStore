// TODO: Move to https
const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');

require('./mongoose/index');
const userRouter = require('./routes/user');
const itemRouter = require('./routes/item');

const key = fs.readFileSync('./cert/key.pem');
const cert = fs.readFileSync('./cert/certificate.pem');
const options = {
  key,
  cert,
};

// Start express
const app = express();
const port = process.env.PORT;

// Set up pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('./public'));
app.use(express.json());
app.use(userRouter);
app.use(itemRouter);

const server = https.createServer(options, app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on port ${port}`);
});
