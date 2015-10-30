

module.exports = {

  schema: true,

  attributes: {

    ideas: {

      collection: 'idea',
    },

    board: {

      model: 'board',
    },

    vote: {

      type: 'integer',
    },

    lastUpdated: {

      model: 'user',
    },
  },
};
