const router = require('express').Router();
const { celebrate, Joi, Segments } = require('celebrate');
const { getArticles, createArticle, deleteArticle } = require('../controllers/articles');
const auth = require('../middlewares/auth');

router.get('/articles', auth, getArticles);

router.post('/articles', auth, celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().required(),
    keyword: Joi.string().required(),
    text: Joi.string().required(),
    source: Joi.string().required(),
    date: Joi.string().required(),
    link: Joi.string().required().regex(/(https?:\/\/(www\.)?[a-zA-Z0-9-]+\.\S+#?$)/),
    image: Joi.string().required().regex(/(https?:\/\/(www\.)?[a-zA-Z0-9-]+\.\S+#?$)/),
  }),
}), createArticle);

router.delete('/articles/:articleId', auth, celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    articleId: Joi.string().alphanum().length(24),
  }),
}), deleteArticle);

module.exports = router;
