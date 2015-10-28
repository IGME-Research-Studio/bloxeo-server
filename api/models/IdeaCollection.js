

module.exports = {

  schema: true,

  attributes: {

    ideas: {

      collection: 'idea',
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
