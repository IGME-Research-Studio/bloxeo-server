import log from 'winston';
import _ from 'lodash';

const clientOmit = (obj) => _.omit(obj, '_id');

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

  /**
   * {_id: 1} => {}
   * @param {MongooseObject} mongooseResult
   * @return {Object}
   */
  toClientObj: (mongooseResult) => {
    return clientOmit(utils.toClient(mongooseResult));
  },

  /**
   * [{_id: 1}, {_id: 2}] => [{}, {}]
   * @param {MongooseObject} mongooseResult
   * @return {Object}
   */
  toClientArrOfObjs: (mongooseResult) => {
    return _.map(utils.toClient(mongooseResult), clientOmit);
  },

  /**
   * {1: {_id: 1}, 2: {_id: 2}} => {1: {}, 2: {}}
   * @param {MongooseObject} mongooseResult
   * @return {Object}
   */
  toClientObjOfObjs: (mongooseResult) => {
    return _.mapValues(utils.toClient(mongooseResult), clientOmit);
  },

  errorHandler: (err) => {
    // log.error(err.message);
    // log.error(err.stack);
    throw err;
  },
};

module.exports = utils;
