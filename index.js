var util = require('util'),

    vow = require('vow'),
    request = require('request'),
    mime = require('mime'),

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

        this._read = {};
        this._read.options = this._createOptionsFromBase(this._base);
        this._read.options.method = 'GET';
        this._read.url = util.format('http://%s:%s/get-%s/',
            this._options.get.host, this._options.get.port, this._options.namespace);

        this._write = {};
        this._write.options = this._createOptionsFromBase(this._base);
        this._write.options.method = 'POST';
        this._write.options.headers = { Authorization: this._options.auth };
        this._write.url = util.format('http://%s:%s/upload-%s/',
            this._options.post.host, this._options.post.port, this._options.namespace);

        this._remove = {};
        this._remove.options = this._createOptionsFromBase(this._base);
        this._remove.options.method = 'GET';
        this._remove.options.headers = { Authorization: this._options.auth };
        this._remove.url = util.format('http://%s:%s/delete-%s/',
            this._options.post.host, this._options.post.port, this._options.namespace);
    },

    /**
     * Reads data by given string key.
     * @param {String} key - key of record
     * @param {Function} [callback] function. If callback function is not present
     * then function will return the promise which state will depend on request execution
     * @returns {*}
     */
    read: function (key, callback) {
        return this._sendRequest(this._getCommonReadOptions(key), callback);
    },

    /**
     * Returns streamed key value
     * @param {String} key - key of record
     * @returns {Stream}
     */
    readToStream: function (key) {
        return request(this._getCommonReadOptions(key));
    },

    /**
     * Writes value by given string key.
     * @param {String} key - key of record
     * @param {String} value - data converted to string
     * @param {Function} [callback] function. If callback function is not present
     * then function will return the promise which state will depend on request execution
     * @returns {*}
     */
    write: function (key, value, callback) {
        var options = this._getCommonWriteOptions(key);
        options.body = value;
        return this._sendRequest(options, callback);
    },

    /**
     * Removes value by given string key
     * @param {String} key - key of record
     * @param {Function} [callback] function. If callback function is not present
     * then function will return the promise which state will depend on request execution
     */
    remove: function (key, callback) {
        var options = this._createOptionsFromBase(this._remove.options);
        options.url = this._remove.url + key;
        return this._sendRequest(options, callback);
    },

    /**
     * Short alias for call read method with promise result
     * @param {String} key - key of record
     * @deprecated
     * @returns {Promise}
     */
    readP: function (key) {
        this._log('"readP" method is deprecated. Use "read" instead');
        return this.read(key);
    },

    /**
     * Short alias for call write method with promise result
     * @param {String} key - key of record
     * @param {String} value - data converted to string
     * @deprecated
     * @returns {Promise}
     */
    writeP: function (key, value) {
        this._log('"writeP" method is deprecated. Use "write" instead');
        return this.write(key, value);
    },

    /**
     * Short alias for call remove method with promise result
     * @param {String} key - key of record
     * @deprecated
     * @returns {Promise}
     */
    removeP: function (key) {
        this._log('"removeP" method is deprecated. Use "remove" instead');
        return this.remove(key);
    },

    /**
     * Returns full url on mds storage
     * @param {String} key - key of record
     * @returns {String}
     */
    getFullUrl: function (key) {
        return this._read.url + key;
    },

    /**
     * Returns mds wrapper options
     * @returns {Object}
     */
    getOptions: function () {
        return this._options;
    },

    /**
     * Generates options for read requests
     * @param {String} key - key of record
     * @returns {Object}
     * @private
     */
    _getCommonReadOptions: function (key) {
        var options = this._createOptionsFromBase(this._read.options);
        options.url = this._read.url + key;
        options.headers = options.headers || {};
        key && (options.headers['Content-type'] = mime.lookup(key));
        return options;
    },

    /**
     * Generates options for write requests
     * @param {String} key - key of record
     * @returns {Object}
     * @private
     */
    _getCommonWriteOptions: function (key) {
        var options = this._createOptionsFromBase(this._write.options);
        options.url = this._write.url + key;
        key && (options.headers['Content-type'] = mime.lookup(key));
        return options;
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

    /**
     * Sends request
     * @param {Object} opts - request options
     * @param {Function} [callback] callback function
     * @returns {Promise|void 0} Promise if callback does not exists, nothing otherwise
     * @private
     */
    _sendRequest: function (opts, callback) {
        var _this = this,
            def = vow.defer();

        this._log(util.format('_sendRequest: %s', opts.url));
        request(opts, function (error, response, body) {
            if (error) {
                def.reject(error);
            } else {
                _this._log(util.format('response status %s for url: %s', response.statusCode, opts.url));

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

        if (!callback) {
            return def.promise();
        } else {
            return def.promise()
                .then(function (data) { callback(null, data); })
                .fail(callback)
                .done();
        }
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
    }
};

module.exports = MDS;
