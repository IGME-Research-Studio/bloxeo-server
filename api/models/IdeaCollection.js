

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

    ideaContentToJSON: function() {
      const obj = this.populate('ideas').toObject();
      const ideaContents = [];
      for (let i = 0; i < obj.ideas.length; i++) {
        ideaContents.push(obj.ideas[i].content);
      }
      return ideaContents;
    },
  },
};
