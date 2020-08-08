const express = require('express');
require('./db/mongoose');
const userRouter = require('./api/routers/user');
const taskRouter = require('./api/routers/item');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on port ${port}`);
});
