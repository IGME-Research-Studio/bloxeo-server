import R from 'ramda';

import mongoose from 'mongoose';
import Monky from 'monky';

import {schema as BoardSchema} from '../api/models/Board';
import {schema as UserSchema} from '../api/models/User';
import {schema as IdeaSchema} from '../api/models/Idea';
import {schema as IdeaCollectionSchema} from '../api/models/IdeaCollection';
import {schema as ResultSchema} from '../api/models/Result';

import {BOARDID, USERNAME, RESULT_KEY,
        COLLECTION_KEY, IDEA_CONTENT} from './constants';
import database from '../api/services/database';

export const monky = new Monky(mongoose);

export const connectDB = R.once(database);

export const setupFixtures = R.once((err, db, cb) => {
  mongoose.model('Board', BoardSchema);
  mongoose.model('User', UserSchema);
  mongoose.model('Idea', IdeaSchema);
  mongoose.model('IdeaCollection', IdeaCollectionSchema);
  mongoose.model('Result', ResultSchema);

  monky.factory('Board', {boardId: BOARDID});

  monky.factory('User', {username: USERNAME});

  monky.factory('Idea', {
    boardId: BOARDID,
    content: `${IDEA_CONTENT}#n`,
    userId: monky.ref('User')});

  monky.factory('IdeaCollection', {
    key: `${COLLECTION_KEY}#n`,
    boardId: BOARDID,
    ideas: [monky.ref('Idea')],
    lastUpdatedId: monky.ref('User')});

  monky.factory('Result', {
    key: RESULT_KEY,
    boardId: BOARDID,
    round: 0,
    votes: 0,
    ideas: [monky.ref('Idea')],
    lastUpdatedId: monky.ref('User')});

  if (err) cb(err);
  else cb();
});
