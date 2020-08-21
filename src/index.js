const express = require('express');
require('./db/mongoose');
const userRouter = require('./api/routers/user');
const itemRouter = require('./api/routers/item');

const app = express();
const port = process.env.PORT;

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

app.use(express.json());
app.use(userRouter);
app.use(itemRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on port ${port}`);
});
