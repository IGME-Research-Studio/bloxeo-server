/*
 * event-bus
 *
 * exports a singleton event stream for the internal application logic
 */

import { EventEmitter } from 'events';

export default new EventEmitter();
