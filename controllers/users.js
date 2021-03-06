const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('./errors/bad-req-err');
const NotFoundError = require('./errors/not-found-err');
const ConflictError = require('./errors/conflict-err');
const UnauthorizedError = require('./errors/unauth-err');

const { SECRET_KEY = 'eminem' } = process.env;

const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Переданы некорректные данные!');
  }
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль');
          }
          const token = jwt.sign(
            { _id: user._id },
            SECRET_KEY,
            { expiresIn: '7d' },
          );
          res.send({ token });
        }).catch(next);
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .orFail(() => new Error('NotFound'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные!');
      } else if (err.message === 'NotFound') {
        throw new NotFoundError('Пользователь не найден');
      } else {
        throw err;
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Переданы некорректные данные!');
  }
  User.findOne({ email }).then((user) => {
    if (user) {
      throw new ConflictError('Пользователь с таким email уже зарегистрирован');
    }
    return bcrypt.hash(req.body.password, 10);
  })
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then(({ email: resEmail, _id }) => res.send({ email: resEmail, _id }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные!');
      }
      throw err;
    })
    .catch(next);
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
};
