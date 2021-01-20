const router = require('express').Router();
const { celebrate, Joi, Segments } = require('celebrate');
const {
  createUser,
  login,
  getCurrentUser,
} = require('../controllers/users');
const auth = require('../middlewares/auth');

router.get('/users/me', auth, getCurrentUser);

router.post('/signup', celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }).unknown(),
}), createUser);

router.post('/signin', celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
}), login);

module.exports = router;
