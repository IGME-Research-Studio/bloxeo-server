

module.exports = {

  schema: true,

  attributes: {

    ideas: {

      collection: 'idea',
    },

    board: {

      model: 'board',
    },

    votes: {

      type: 'integer',
    },

    draggable: {
      type: 'boolean',
    },

    lastUpdated: {

      model: 'user',
    },
  },
};
