import _ from 'lodash';
import log from 'winston';

const utils = {
  /**
   * @param {String|Array} omitBy - keys to omit
   * @param {Object} obj - object to omit from
   */
  cbOmit: (omitBy) => _.partialRight(_.omit, this, omitBy),

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
  strip: (mongooseResult, omitBy='_id') => {
    return _.omit(utils.toClient(mongooseResult), omitBy);
  },

  /**
   * [{_id: 1}, {_id: 2}] => [{}, {}]
   * @param {MongooseObject} mongooseResult
   * @return {Object}
   */
  stripArr: (mongooseResult, omitBy='_id') => {
    return _.map(utils.toClient(mongooseResult), utils.cbOmit(omitBy));
  },

  /**
   * {1: {_id: 1}, 2: {_id: 2}} => {1: {}, 2: {}}
   * @param {MongooseObject} mongooseResult
   * @return {Object}
   */
  stripObjs: (mongooseResult, omitBy='_id') => {
    return _.mapValues(utils.toClient(mongooseResult), utils.cbOmit(omitBy));
  },

  /**
   * {1: {_id: 1, arrKey: [{_id: 2}]}} => {1: {arrKey: [{}]}}
   */
  stripObjsAndNestedArr: (mongooseResult, omitBy='_id', arrKey='ideas') => {
    const strippedObjs = utils.stripObjs(mongooseResult, omitBy)
    // console.log('STRIPPED OBJS:\n', JSON.stringify(strippedObjs, null, 2));
    const stripped = _.mapValues(strippedObjs,
                       (obj) => {
                         obj[arrKey] = _.map(obj[arrKey], utils.cbOmit(omitBy))
                         return obj;
                       });
    // console.log('FINAL:\n: ', JSON.stringify(stripped, null, 2));

    return utils.toClient(stripped);
  },

  errorHandler: (err) => {
    log.error(err.message);
    log.error(err.stack);
    throw err;
  },
};

module.exports = utils;
