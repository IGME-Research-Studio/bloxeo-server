

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
      defaultsTo: 0,
    },

    lastUpdated: {

      model: 'user',
    },
  },
};
