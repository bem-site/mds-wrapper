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

    _errors: {
        MISSING_AUTH: 'Auth headers missed or invalid',
        NO_EMPTY_SPACE: 'No empty space in MDS storage',
        INVALID_REQUEST: 'Invalid request',
        MDS: 'MDS internal error'
    },

    /**
     * Creates log message in console
     * @param {String} message - log message
     * @private
     */
    _log: function (message) {
        if (this._options.debug) {
            console.log(message);
        }
    },

    _logRS: function (status, url) {
        this._log(util.format('response status %s for url: %s', status, url));
    },

    /**
     * Executes request sending with given options and callback function
     * @param {Object} opts - request options object
     * @param {Function} callback function
     * @returns {*}
     * @private
     */
    _sendRequestWithCallback: function (opts, callback) {
        var _this = this;
        this._log(util.format('_sendRequestWithCallback: %s', opts.url));
        request(opts, function (error, response, body) {
            if (error) {
                return callback(error);
            }

            _this._logRS(response.statusCode, opts.url);

            if (response.statusCode === 200) {
                return callback(null, body);
            }
            if (response.statusCode === 404) {
                return callback(null, null);
            }
            if (response.statusCode === 400) {
                return callback(new Error(_this._errors.INVALID_REQUEST));
            }
            if (response.statusCode === 401) {
                return callback(new Error(_this._errors.MISSING_AUTH));
            }
            if (response.statusCode === 507) {
                return callback(new Error(_this._errors.NO_EMPTY_SPACE));
            }
            if (response.statusCode >= 500) {
                return callback(new Error(_this._errors.MDS));
            }
        });
    },

    /**
     * Executes request sending and return promise object
     * @param {Object} opts - request options object
     * @returns {*}
     * @private
     */
    _sendRequestWithPromise: function (opts) {
        var _this = this,
            def = vow.defer();
        this._log(util.format('_sendRequestWithPromise: %s', opts.url));
        request(opts, function (error, response, body) {
            if (error) {
                def.reject(error);
            } else {
                _this._logRS(response.statusCode, opts.url);

                if (response.statusCode === 200) {
                    def.resolve(body);
                }
                if (response.statusCode === 404) {
                    def.resolve(null);
                }
                if (response.statusCode === 400) {
                    def.reject(new Error(_this._errors.INVALID_REQUEST));
                }
                if (response.statusCode === 401) {
                    def.reject(new Error(_this._errors.MISSING_AUTH));
                }
                if (response.statusCode === 507) {
                    def.reject(new Error(_this._errors.NO_EMPTY_SPACE));
                }
                if (response.statusCode >= 500) {
                    def.reject(new Error(_this._errors.MDS));
                }
            }
        });
        return def.promise();
    },

    /**
     * Creates new object and copy all properties from base object into it
     * @param {Object} base object
     * @returns {Object} new instance of base object
     * @private
     */
    _createOptionsFromBase: function (base) {
        return Object.keys(base).reduce(function (prev, key) {
            prev[key] = base[key];
            return prev;
        }, {});
    },

    /**
     * Initialize options for read methods
     * @private
     */
    _initReadOptions: function () {
        this._read = {};
        this._read.options = this._createOptionsFromBase(this._base);
        this._read.options.method = 'GET';
        this._read.url = util.format('http://%s:%s/get-%s/',
            this._options.get.host, this._options.get.port, this._options.namespace);
    },

    /**
     * Initialize options for write methods
     * @private
     */
    _initWriteOptions: function () {
        this._write = {};
        this._write.options = this._createOptionsFromBase(this._base);
        this._write.options.method = 'POST';
        this._write.options.headers = { Authorization: this._options.auth };
        this._write.url = util.format('http://%s:%s/upload-%s/',
            this._options.post.host, this._options.post.port, this._options.namespace);
    },

    /**
     * Initialize options for remove methods
     * @private
     */
    _initRemoveOptions: function () {
        this._remove = {};
        this._remove.options = this._createOptionsFromBase(this._base);
        this._remove.options.method = 'GET';
        this._remove.options.headers = { Authorization: this._options.auth };
        this._remove.url = util.format('http://%s:%s/delete-%s/',
            this._options.post.host, this._options.post.port, this._options.namespace);
    },

    /**
     * Initialize mds storage by given configuration
     * @param {Object} options - configuration object
     */
    init: function (options) {
        if (!options) {
            throw new Error('Can\'t initialize mds wrapper. Options undefined.');
        }

        this._options = options;
        this._base.timeout = options.timeout || 5000;

        if (!this._options.get) {
            throw new Error('Can\'t initialize mds wrapper. Options for read data requests undefined.');
        }

        if (!this._options.post) {
            throw new Error('Can\'t initialize mds wrapper. Options for write data requests undefined.');
        }

        this._options.get.host = this._options.get.host || this._options.host || '127.0.0.1';
        this._options.get.port = this._options.get.port || 80;

        this._options.post.host = this._options.post.host || this._options.host || '127.0.0.1';
        this._options.post.port = this._options.post.port || 1111;

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
        var o = this._createOptionsFromBase(this._read.options);
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
        var o = this._createOptionsFromBase(this._write.options);
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
        var o = this._createOptionsFromBase(this._remove.options);
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
