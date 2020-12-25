const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');
const routes = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const limiter = require('./middlewares/rate-limiter');
require('dotenv').config();

const { PORT = 3000 } = process.env;
const { DATABASE_URL = 'mongodb://localhost:27017/newsdb' } = process.env;
const { NODE_ENV = 'development' } = process.env;
const app = express();
const NotFoundError = require('./controllers/errors/not-found-err');
const centralErrorHandler = require('./middlewares/error-handler');

if (NODE_ENV !== 'production') {
  console.log('Код запущен в режиме разработки');
}

app.use(cors());

app.use(helmet());

app.use(requestLogger);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(routes);

app.use(errorLogger);

app.use(errors());

app.use((req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

app.use(centralErrorHandler);

app.use(limiter);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
