const express = require('express');
const handlebars = require('express-handlebars');

require('./db/mongoose');
const userRouter = require('./api/routers/user');
const itemRouter = require('./api/routers/item');

const app = express();
const port = process.env.PORT;

app.engine(
  'handlebars',
  handlebars({
    defaultLayout: false,
  }),
);
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);

app.use(express.json());
app.use(userRouter);
app.use(itemRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on port ${port}`);
});
