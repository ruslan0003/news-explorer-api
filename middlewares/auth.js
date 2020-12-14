const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../controllers/errors/unauth-err');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization && !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, process.env.SECRET_KEY);
  } catch (err) {
    throw new UnauthorizedError('Пользователь не авторизован!');
  }

  req.user = payload;

  console.log(payload);

  return next();
};
