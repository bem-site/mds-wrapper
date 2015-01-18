var util = require('util'),

    vow = require('vow'),
    request = require('request'),

    MDS = function (options) {
        this.init(options);
    };

MDS.prototype = {
    _options: undefined,
    _base: {
        encoding: 'utf-8',
        timeout: 5000
    },
    _read: undefined,
    _write: undefined,
    _remove: undefined,

    /**
     * Executes request sending with given options and callback function
     * @param {Object} opts - request options object
     * @param {Function} callback function
     * @returns {*}
     * @private
     */
    _sendRequestWithCallback: function (opts, callback) {
        request(opts, function (error, response, body) {
            error ? callback(error) : callback(null, response.statusCode === 404 ? null : body);
        });
    },

    /**
     * Executes request sending and return promise object
     * @param {Object} opts - request options object
     * @returns {*}
     * @private
     */
    _sendRequestWithPromise: function (opts) {
        var def = vow.defer();
        request(opts, function (error, response, body) {
            error ? def.reject(error) : def.resolve(response.statusCode === 404 ? null : body);
        });
        return def.promise();
    },

    /**
     * Initialize options for read methods
     * @private
     */
    _initReadOptions: function () {
        this._read = {};
        this._read.options = Object.create(this._base);
        this._read.options.method = 'GET';
        this._read.url = util.format('http://%s:%s/get-%s/',
            this._options.host, this._options.get.port, this._options.namespace);
    },

    /**
     * Initialize options for write methods
     * @private
     */
    _initWriteOptions: function () {
        this._write = {};
        this._write.options = Object.create(this._base);
        this._write.options.method = 'POST';
        this._write.options.headers = { Authorization: this._options.auth };
        this._write.url = util.format('http://%s:%s/upload-%s/',
            this._options.host, this._options.post.port, this._options.namespace);
    },

    /**
     * Initialize options for remove methods
     * @private
     */
    _initRemoveOptions: function () {
        this._remove = {};
        this._remove.options = Object.create(this._base);
        this._remove.options.method = 'GET';
        this._remove.options.headers = { Authorization: this._options.auth };
        this._remove.url = util.format('http://%s:%s/delete-%s/',
            this._options.host, this._options.post.port, this._options.namespace);
    },

    /**
     * Initialize mds storage by given configuration
     * @param {Object} options - configuration object
     */
    init: function (options) {
        this._options = options;
        this._initReadOptions();
        this._initWriteOptions();
        this._initRemoveOptions();
    },

    /**
     * Reads data by given string key.
     * @param {String} key - key of record
     * @param {Function} callback function. Optional parameter. If callback function is not present
     * then function will return the promise which state will depend on request execution
     * @returns {*}
     * @private
     */
    read: function (key, callback) {
        var o = Object.create(this._read.options);
        o.url = this._read.url + key;
        return callback !== null ?
            this._sendRequestWithCallback(o, callback) :
            this._sendRequestWithPromise(o);
    },

    /**
     * Writes value by given string key.
     * @param {String} key - key of record
     * @param {String} value - data converted to string
     * @param {Function} callback function. Optional parameter. If callback function is not present
     * then function will return the promise which state will depend on request execution
     * @returns {*}
     * @private
     */
    write: function (key, value, callback) {
        var o = Object.create(this._write.options);
        o.url = this._write.url + key;
        o.body = value;
        return callback !== null ?
            this._sendRequestWithCallback(o, callback) :
            this._sendRequestWithPromise(o);
    },

    /**
     * Removes value by given string key
     * @param {String} key - key of record
     * @param {Function} callback function. Optional parameter. If callback function is not present
     * then function will return the promise which state will depend on request execution
     * @private
     */
    remove: function (key, callback) {
        var o = Object.create(this._remove.options);
        o.url = this._remove.url + key;
        return callback !== null ?
            this._sendRequestWithCallback(o, callback) :
            this._sendRequestWithPromise(o);
    },

    /**
     * Short alias for call read method with promise result
     * @param {String} key - key of record
     * @returns {*}
     */
    readP: function (key) {
        return this.read(key, null);
    },

    /**
     * Short alias for call write method with promise result
     * @param {String} key - key of record
     * @param {String} value - data converted to string
     * @returns {*}
     */
    writeP: function (key, value) {
        return this.write(key, value, null);
    },

    /**
     * Short alias for call remove method with promise result
     * @param {String} key - key of record
     * @returns {*}
     */
    removeP: function (key) {
        return this.remove(key, null);
    }
};

module.exports = MDS;
