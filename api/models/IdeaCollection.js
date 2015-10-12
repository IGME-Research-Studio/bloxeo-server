

module.exports = {

  schema: true,

  attributes: {

    ideas: {

      collection: 'idea',
    },

    weight: {

      type: 'integer',
      required: true,
    },

    lastUpdated: {

      model: 'user',
    },
  },
};
