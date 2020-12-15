const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  keyword: {
    type: String,
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  source: {
    type: String,
    required: true,
  },

  link: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /(https?:\/\/(www\.)?[a-zA-Z0-9-]+\.\S+#?$)/ig.test(v);
      },
      message: (props) => `${props.value} не является корректной ссылкой`,
    },
  },

  image: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /(https?:\/\/(www\.)?[a-zA-Z0-9-]+\.\S+#?$)/ig.test(v);
      },
      message: (props) => `${props.value} не является корректной ссылкой`,
    },
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    select: false,
  },

  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

module.exports = mongoose.model('card', cardSchema);
