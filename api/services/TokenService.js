/**
 * Token Service
 *
 * @file Contains logic for Token related actions
 * @module TokenService api/services/TokenService
 */
const JWT = require('jsonwebtoken');
const base64UrlEncode = require('base64url').encode;
const config = require('../../config').default.jwt;
const tokenService = {};

tokenService.generateNewToken = function(authData){

  const headerObj = {
    'type': 'JWT',
    'alg': 'HS256',
  };
  const header = JSON.stringify(headerObj);
  const payload = JSON.stringify(authData);

  let encodedString = base64UrlEncode(header) + '.' + base64UrlEncode(payload);
  const token = JWT.sign(
  {'authData': 'data'},
  config.secret,
  {'expiresIn': config.timeout});
  //const signiture = HMACSHA256(encodedString, 'secret');
  //const token = encodedString + '.' + signiture;


  console.log('printing token');
  console.log(token);

//  return JWT.sign(
//  payload || {'user': 'someone', },
//  process.env.TOKEN_SECRET || 'one secret to rule them all');
};

module.exports = tokenService;
