var http = require('http'),

    HOST = '127.0.0.1',
    memStorage = {},

    BaseServer = {
        port: undefined,
        server: undefined,

        init: function () {},

        start: function () {
            this.server.listen(this.port, HOST);
            console.log('Listening at http://' + HOST + ':' + this.port);
        },

        stop: function () {
            this.server.close();
        }
    },

    ReadServer = function (port) {
        this.init(port);
    },

    WriteServer = function (port) {
        this.init(port);
    },

    rs,
    ws;

ReadServer.prototype = Object.create(BaseServer);
ReadServer.prototype.init = function (port) {
    this.port = port || 3000;
    this.server = http.createServer(function (req, res) {
        var url = req.url,
            urlParts = url.replace(/^\//, '').split('/'),
            namespace = urlParts.shift(),
            key = urlParts.join('/'),
            _createResponse = function (status, value) {
                res.writeHead(status, { 'Content-Type': 'text/html' });
                res.end(value);
            };

        if (namespace.match(/^get\-/)) {
            var value = memStorage[key];
            value ? _createResponse(200, value) : _createResponse(404, null);
        } else {
            _createResponse(500, null);
        }
    });
};

WriteServer.prototype = Object.create(BaseServer);
WriteServer.prototype.init = function (port) {
    this.port = port || 3001;
    this.server = http.createServer(function (req, res) {
        var url = req.url,
            urlParts = url.replace(/^\//, '').split('/'),
            namespace = urlParts.shift(),
            key = urlParts.join('/'),
            body = '',
            _createResponse = function (status, value) {
                res.writeHead(status, { 'Content-Type': 'text/html' });
                res.end(value);
            };

        if (namespace.match(/^upload\-/)) {
            req.on('data', function (data) {
                body += data;
            });
            req.on('end', function () {
                memStorage[key] = body;
                _createResponse(200, memStorage[key]);
                res.writeHead(200, { 'Content-Type': 'text/html' });
            });
        } else if (namespace.match(/^delete\-/)) {
            delete memStorage[key];
            _createResponse(200, null);
        } else {
            _createResponse(500, null);
        }
    });
};

/**
 * Starts emulator
 * @param {Number} rsp - port number for read server
 * @param {Number} wsp - port number for write server
 */
exports.start = function (rsp, wsp) {
    rs = new ReadServer(rsp);
    ws = new WriteServer(wsp);

    rs.start();
    ws.start();
};

/**
 * Stops emulator
 */
exports.stop = function () {
    rs.stop();
    ws.stop();
};
