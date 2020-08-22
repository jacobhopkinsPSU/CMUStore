const express = require('express');

require('./mongoose/index');
const userRouter = require('./routes/user');
const itemRouter = require('./routes/item');

// Start express
const app = express();
const port = process.env.PORT;

// Set up ejs as the view engine
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

app.use(express.static('./public'));
app.use(express.json());
app.use(userRouter);
app.use(itemRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on port ${port}`);
});
