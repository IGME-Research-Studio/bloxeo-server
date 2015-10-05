

module.exports = {
  
  schema: true,
  
  attributes: {
    
    room: {
    
      model: 'room',
    },
    
    ideas: {
    
      collection: 'idea',
      via: 'collections',
    },
    
    constraint: {
    
      type: 'integer',
      required: true,
    },
    
    lastUpdated: {
    
      model: 'user',
    },
  },
};