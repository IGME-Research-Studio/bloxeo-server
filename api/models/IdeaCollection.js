

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
      defaultsTo: 0,
    },

    draggable: {
      type: 'boolean',
    },

    draggable: {
      type: 'boolean',
    },

    lastUpdated: {

      model: 'user',
    },
  },
};
