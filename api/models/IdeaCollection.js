

module.exports = {

  schema: true,

  attributes: {

    ideas: {

      collection: 'idea',
    },

    board: {

      model: 'board',
    },

    inWorkspace: {
      type: 'boolean',
      defaultsTo: true,
    },

    votes: {

      type: 'integer',
      defaultsTo: 0,
    },

    draggable: {
      type: 'boolean',
    },

    lastUpdated: {

      model: 'user',
    },
  },
};
