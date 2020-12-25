const Article = require('../models/article');
const BadRequestError = require('./errors/bad-req-err');
const NotFoundError = require('./errors/not-found-err');
const ForbiddenError = require('./errors/forbidden-err');

const getArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .populate('user')
    .then((articles) => res.status(200).send({ data: articles }))
    .catch(() => {
      throw new BadRequestError('Переданы некорректные данные');
    })
    .catch(next);
};

const createArticle = (req, res, next) => {
  const {
    title, keyword, text, source, image, link, date,
  } = req.body;
  Article.create({
    title, keyword, text, source, image, link, date, owner: req.user._id,
  })
    .then((article) => {
      const { owner, ...restArticle } = article.toObject();
      res.status(200).send({ restArticle });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные');
      }
      throw err;
    })
    .catch(next);
};

const deleteArticle = (req, res, next) => {
  Article.findById({ _id: req.params.articleId }).select('+owner')
    .orFail(new NotFoundError('Карточка с таким id не найдена в базе'))
    .then(((article) => {
      const articleOwnerId = article.owner.toString();
      const reqUserId = req.user._id.toString();
      if (articleOwnerId !== reqUserId) {
        throw new ForbiddenError('Пользователь не может удалять чужие карточки!');
      }
      return article.remove()
        .then((deletedArticle) => {
          const { owner, ...restArticle } = deletedArticle.toObject();
          res.status(200).send({ restArticle });
        });
    }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      }
      throw err;
    })
    .catch(next);
};

module.exports = {
  getArticles,
  createArticle,
  deleteArticle,
};
