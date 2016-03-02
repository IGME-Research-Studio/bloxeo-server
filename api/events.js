import getConstants from './handlers/v1/constants/index';
import joinRoom from './handlers/v1/rooms/join';
import leaveRoom from './handlers/v1/rooms/leave';
import createIdea from './handlers/v1/ideas/create';
import destroyIdea from './handlers/v1/ideas/destroy';
import getIdeas from './handlers/v1/ideas/index';
import createCollection from './handlers/v1/ideaCollections/create';
import destroyCollection from './handlers/v1/ideaCollections/destroy';
import addIdea from './handlers/v1/ideaCollections/addIdea';
import removeIdea from './handlers/v1/ideaCollections/removeIdea';
import getCollections from './handlers/v1/ideaCollections/index';
import { ready as readyUser } from './handlers/v1/voting/ready';
import getResults from './handlers/v1/voting/results';
import vote from './handlers/v1/voting/vote';
import { voteList as getVoteItems } from './handlers/v1/voting/voteList';
import startTimerCountdown from './handlers/v1/timer/start';
import disableTimer from './handlers/v1/timer/stop';
import getTimeRemaining from './handlers/v1/timer/get';
import enableIdeas from './handlers/v1/state/enableIdeaCreation';
import disableIdeas from './handlers/v1/state/disableIdeaCreation';
import forceVote from './handlers/v1/state/forceVote';
import forceResults from './handlers/v1/state/forceResults';
import getCurrentState from './handlers/v1/state/get';
import {update as updateBoard} from './handlers/v1/rooms/update';
import getOptions from './handlers/v1/rooms/getOptions';
import getUsers from './handlers/v1/rooms/getUsers';

import * as EVENTS from './constants/EXT_EVENT_API';

const eventMap = {};

eventMap[EVENTS.GET_CONSTANTS]        = getConstants;

eventMap[EVENTS.JOIN_ROOM]            = joinRoom;
eventMap[EVENTS.LEAVE_ROOM]           = leaveRoom;
eventMap[EVENTS.UPDATE_BOARD]         = updateBoard;
eventMap[EVENTS.GET_OPTIONS]          = getOptions;
eventMap[EVENTS.GET_USERS]            = getUsers;

eventMap[EVENTS.CREATE_IDEA]          = createIdea;
eventMap[EVENTS.DESTROY_IDEA]         = destroyIdea;
eventMap[EVENTS.GET_IDEAS]            = getIdeas;

eventMap[EVENTS.CREATE_COLLECTION]    = createCollection;
eventMap[EVENTS.DESTROY_COLLECTION]   = destroyCollection;
eventMap[EVENTS.ADD_IDEA]             = addIdea;
eventMap[EVENTS.REMOVE_IDEA]          = removeIdea;
eventMap[EVENTS.GET_COLLECTIONS]      = getCollections;

eventMap[EVENTS.GET_VOTING_ITEMS]     = getVoteItems;
eventMap[EVENTS.READY_USER]           = readyUser;

eventMap[EVENTS.GET_RESULTS]          = getResults;
eventMap[EVENTS.VOTE]                 = vote;

eventMap[EVENTS.START_TIMER]          = startTimerCountdown;
eventMap[EVENTS.DISABLE_TIMER]        = disableTimer;

eventMap[EVENTS.ENABLE_IDEAS]         = enableIdeas;
eventMap[EVENTS.DISABLE_IDEAS]        = disableIdeas;

eventMap[EVENTS.FORCE_VOTE]           = forceVote;
eventMap[EVENTS.FORCE_RESULTS]        = forceResults;

eventMap[EVENTS.GET_STATE]            = getCurrentState;
eventMap[EVENTS.GET_TIME]             = getTimeRemaining;

export default eventMap;
