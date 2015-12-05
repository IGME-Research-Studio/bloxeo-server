import log from 'winston';

const utils = {
  /**
   * The results of Mongoose queries are objects which have a number of methods
   * that aren't relevant when we send them to client. The easiest way to get rid
   * of them is to use the built in toString method which just includes the data.
   *
   * This helper method wraps this operation up neatly
   * @param {MongooseObject} mongooseResult
   * @return {Object}
   */
  toClient: (mongooseResult) => {
    return JSON.parse(JSON.stringify(mongooseResult));
  },

  toClientArrayOfObjects: (mongooseResult) => {
    return JSON.parse(JSON.stringify(mongooseResult));
  },

  errorHandler: (err) => {
    // log.error(err.message);
    // log.error(err.stack);
    throw err;
  },
};

module.exports = utils;
