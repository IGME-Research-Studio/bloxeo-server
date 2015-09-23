const User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {

    isFullAccount: {

      type: 'boolean',
      required: true,
    },

    uuid: {

      type: 'string',
      required: true,
      unique: true,
    },

    username: {

      type: 'string',
      unique: true,
    },

    password: {

      type: 'string',
    },

    email: {

      type: 'email',
      unique: true,
    },

    rooms: {

      type: 'array',
    },
  },
};

module.exports = User;
