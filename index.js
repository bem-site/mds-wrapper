var util = require('util'),

    _ = require('lodash'),
    vow = require('vow'),

    request = require('request'),

    BASE_OPTIONS = {
        encoding: 'utf-8',
        timeout: 5000
    },

    configuration = {
        host: 'localhost',
        namespace: 'my-site',
        get: { port: 80 },
        post: { port: 1111 },
        auth: 'My authorization key'
    };
    /*
    configuration = {
        host: 'storage-int.mdst.yandex.net',
        namespace: 'lego-site',
        get: {
            port: 80
        },
        post: {
            port: 1111
        },
        auth: 'Basic bGVnby1zaXRlOjJkZGUyZjI0OGIxODI2NWRiZWM2ZGRiOGVhMjBkNjg0'
    };
    */

/**
 * Executes request sending with given options and callback function
 * @param {Object} opts - request options object
 * @param {Function} callback function (optional parameter)
 * @returns {*}
 * @private
 */
function _sendRequest(opts, callback) {
    if (callback) {
        request(opts, function (error, response, body) {
            error ? callback(error) : callback(null, body);
        });
    } else {
        var def = vow.defer();
        request(opts, function (error, response, body) {
            error ? def.reject : def.resolve(body);
        });
        return def.promise();
    }
}

/**
 * Initialize mds storage by given configuration
 * @param conf
 */
function init(conf) {
    configuration = conf;
}

/**
 * Reads data by given string key.
 * @param {String} key - key of record
 * @param {Function} callback function. Optional parameter. If callback function is not present
 * then function will return the promise which state will depend on request execution
 * @returns {*}
 */
function read(key, callback) {
    var requestOptions = {
            method: 'GET'
        },
        url = util.format('http://%s:%s/get-%s/%s',
            configuration.host, configuration.get.port, configuration.namespace, key),
        opts = _.extend({}, BASE_OPTIONS, requestOptions, { url: url });

    return _sendRequest(opts, callback);
}

/**
 * Writes value by given string key.
 * @param {String} key - key of record
 * @param {String} value - data converted to string
 * @param {Function} callback function. Optional parameter. If callback function is not present
 * then function will return the promise which state will depend on request execution
 * @returns {*}
 */
function write(key, value, callback) {
    var requestOptions = {
            method: 'POST',
            headers: {
                Authorization: configuration.auth
            }
        },
        url = util.format('http://%s:%s/upload-%s/%s',
            configuration.host, configuration.post.port, configuration.namespace, key),
        opts = _.extend({}, BASE_OPTIONS, requestOptions, {
            url: url,
            body: value
        });

    return _sendRequest(opts, callback);
}

/**
 * Removes value by given string key
 * @param {String} key - key of record
 * @param {Function} callback function. Optional parameter. If callback function is not present
 * then function will return the promise which state will depend on request execution
 */
function remove(key, callback) {
    var requestOptions = {
            method: 'GET',
            headers: {
                Authorization: configuration.auth
            }
        },
        url = util.format('http://%s:%s/delete-%s/%s',
            configuration.host, configuration.post.port, configuration.namespace, key),
        opts = _.extend({}, BASE_OPTIONS, requestOptions, { url: url });

    return _sendRequest(opts, callback);
}

exports.init = init;
exports.read = read;
exports.write = write;
exports.remove = remove;
