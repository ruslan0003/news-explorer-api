const Article = require('../models/article');
const BadRequestError = require('./errors/bad-req-err');
const NotFoundError = require('./errors/not-found-err');
const ForbiddenError = require('./errors/forbidden-err');

const getArticles = (req, res, next) => {
  Article.find({ owner: req.user._id}).select('+owner')
    .populate('user')
    .then((articles) => res.status(200).send({ data: articles }))
    .catch(() => {
      throw new BadRequestError('Переданы некорректные данные');
    })
    .catch(next);
};

const createArticle = (req, res, next) => {
  const { title, keyword, text, source, image, link, date } = req.body;
  Article.create({ title, keyword, text, source, image, link, date, owner: req.user._id })
    .then((article) => res.status(200).send({ article }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

const deleteArticle = (req, res, next) => {
  Article.findById({ _id: req.params.articleId }).select('+owner')
    .orFail(new Error('NotValidId'))
    .then(((article) => {
      const articleOwnerId = JSON.stringify(article.owner);
      const reqUserId = JSON.stringify(req.user._id);
      if (articleOwnerId !== reqUserId) {
        throw new Error('Forbidden');
      }
      article.remove()
        .then((deletedArticle) => res.status(200).send(deletedArticle))
        .catch(next);
    }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      } else if (err.message === 'NotValidId') {
        throw new NotFoundError('Карточка с таким id не найдена в базе');
      } else if (err.message === 'Forbidden') {
        throw new ForbiddenError('Пользователь не может удалять чужие карточки!');
      }
    })
    .catch(next);
};

module.exports = {
  getArticles,
  createArticle,
  deleteArticle,
};