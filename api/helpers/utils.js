import { T, any, either, cond, isNil, isEmpty,
  curry, pipe, map, omit } from 'ramda';

const utils = {};

/**
 * The results of Mongoose queries are objects which have a number of methods
 * that aren't relevant when we send them to client. The easiest way to get rid
 * of them is to use the built in toString method which just includes the data.
 *
 * This helper method wraps this operation up neatly
 * @param {MongooseObject} mongooseResult
 * @return {Object}
 */
utils.toPlainObject = (mongooseResult) => {
  return JSON.parse(JSON.stringify(mongooseResult));
};

/**
 * {_id: 1} => {}
 * @param {MongooseObject} mongooseResult
 * @param {Array<String>} omitBy
 * @return {Object}
 */
utils.strip = (mongooseResult, omitBy = ['_id']) => {
  return pipe(omit(omitBy), utils.toPlainObject)(mongooseResult);
};

/**
 * [{_id: 1}, {_id: 2}] => [{}, {}]
 * or
 * {1: {_id: 1}, 2: {_id: 2}} => {1: {}, 2: {}}
 * @param {MongooseObject} mongooseResult
 * @param {Array<String>} omitBy
 * @return {Object}
 */
utils.stripMap = (mongooseResult, omitBy = ['_id']) => {
  return pipe(map(omit(omitBy)), utils.toPlainObject)(mongooseResult);
};

/**
 * {1: {_id: 1, arrKey: [{_id: 2}]}} => {1: {arrKey: [{}]}}
 * @param {MongooseObject} mongooseResult
 * @param {Array<String>} omitBy
 * @param {String} arrKey
 * @return {Object}
 */
utils.stripNestedMap = (mongooseResult,
                        omitBy = ['_id'], arrKey = 'ideas') => {

  const stripNested = (obj) => {
    obj[arrKey] = map(omit(omitBy))(obj[arrKey]);
    return obj;
  };

  return pipe(map(omit(omitBy)),
                  map(stripNested),
                  utils.toPlainObject)(mongooseResult);
};

/**
 * @param {Array<T>} arrayOfValues
 * @returns {Boolean} True if any value is null or undefined
 */
utils.anyAreNil = any(isNil);

/**
 * @param {Type} type
 * @returns {Boolean} true if nil or empty
 */
utils.isNilorEmpty = either(isNil, isEmpty);

/**
 * @param {X -> Boolean} predicate
 * @param {Type} default
 * @param {Type} x value to check
 * @returns {Type} default if predicate is false, if true pass x along
 */
utils.ifPdefaultTo = curry((predicate, def, value) => (
  cond([
    [predicate, () => def],
    [T,         (x) => x],
  ])(value)
));

/*
 * @param {Type} default
 * @param {Type} x value to check
 * @returns {Type} default if x is nil or empty, if true pass x along
 */
utils.emptyDefaultTo = utils.ifPdefaultTo(either(isNil, isEmpty));

module.exports = utils;
