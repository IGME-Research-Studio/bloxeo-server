/**
 * ConstantsController
 *
 * @description :: Server-side logic for passing our routes to Klient
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import ConstantsService from '../../services/ConstantsService';

export default function index(req, res) {
  return res.ok(ConstantsService());
};
