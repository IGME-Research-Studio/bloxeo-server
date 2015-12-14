import R from 'ramda';

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
  toPlainObject: (mongooseResult) => {
    return JSON.parse(JSON.stringify(mongooseResult));
  },

  /**
   * {_id: 1} => {}
   * @param {MongooseObject} mongooseResult
   * @param {Array<String>} omitBy
   * @return {Object}
   */
  strip: (mongooseResult, omitBy = ['_id']) => {
    return R.pipe(R.omit(omitBy), utils.toPlainObject)(mongooseResult);
  },

  /**
   * [{_id: 1}, {_id: 2}] => [{}, {}]
   * or
   * {1: {_id: 1}, 2: {_id: 2}} => {1: {}, 2: {}}
   * @param {MongooseObject} mongooseResult
   * @param {Array<String>} omitBy
   * @return {Object}
   */
  stripMap: (mongooseResult, omitBy = ['_id']) => {
    return R.pipe(R.map(R.omit(omitBy)), utils.toPlainObject)(mongooseResult);
  },

  /**
   * {1: {_id: 1, arrKey: [{_id: 2}]}} => {1: {arrKey: [{}]}}
   * @param {MongooseObject} mongooseResult
   * @param {Array<String>} omitBy
   * @param {String} arrKey
   * @return {Object}
   */
  stripNestedMap: (mongooseResult, omitBy = ['_id'], arrKey = 'ideas') => {
    const stripNested = (obj) => {
      obj[arrKey] = R.map(R.omit(omitBy))(obj[arrKey]);
      return obj;
    };
    return R.pipe(R.map(R.omit(omitBy)),
                     R.map(stripNested),
                     utils.toPlainObject)(mongooseResult);
  },
};

module.exports = utils;
