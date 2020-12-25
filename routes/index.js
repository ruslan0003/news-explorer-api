const router = require('express').Router();

const usersRouter = require('./users');
const cardsRouter = require('./articles');

router.use(
  usersRouter,
  cardsRouter,
);

module.exports = router;
