/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */

module.exports.http = {

  /**
  * Port where to run this app
  * @type {Number}
  */
  port: 1337,

  /**
   * Your SSL certificates
   * @description They are should be as result of fs.readFileSync() method
   * @type {Object}
   * @example
   * ssl: {
   *    cert: fs.readFileSync('your/path/to/cert.pem'),
   *    key: fs.readFileSync('your/path/to/key.pem')
   * }
   */
  ssl: {
    cert: false,
    key: false,
  },

  http: {
    /**
     * This is the options object for the `createServer` method, as discussed here:
     * http://nodejs.org/api/https.html#https_class_https_server
     *
     * @type {Object|Boolean}
     */
    serverOptions: undefined,

    /**
     * You can define own custom middleware here
     * @param app Express application
     */
    // customMiddleware: function(app) {
    // },

    /**
     * Configures the middleware function used for parsing the HTTP request body
     * Defaults to the Formidable-based version built into Express/Connect
     *
     * To enable streaming file uploads (to disk or somewhere else)
     * you'll want to set this option to `false` to disable the body parser
     *
     * @type {Function|Boolean|Object}
     */
    bodyParser: undefined,

    /**
    * Express middleware to use for every Sails request. To add custom
    * middleware to the mix, add a function to the middleware config object and
    * add its key to the "order" array. The $custom key is reserved for
    * backwards-compatibility with Sails v0.9.x apps that use the
    * `customMiddleware` config option.
    *
    * The order in which middleware should be run for HTTP request. (the Sails
    * router is invoked by the "router" middleware below.)
    * @type {Object}
    */
    middleware: {

      /**
      * Middleware for setting Connection: keep-alive to all responses
      */
      keepAlive: function(req, res, next) {
        res.set('Connection', 'keep-alive');
        next();
      },

      /**
      * The order in which middleware should be run for HTTP request
      * @type {Array}
      */
      order: [
        'compress',
        'keepAlive',
        'bodyParser',
        '$custom',
        'router',
        '404',
        '500',
      ],
    },
  },
};

