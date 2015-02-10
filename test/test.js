var should = require('should'),

    MDS = require('../index.js'),
    emulator = require('../mds-emulator'),
    key1 = 'test/unique/key1.html',
    key2 = 'test/unique/key2.png',
    value = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed ' +
        'do eiusmod tempor incididunt ut labore et dolore magna aliqua',

    options = {
        namespace: 'my-site',
        get: {
            host: '127.0.0.1',
            port: 3000
        },
        post: {
            host: '127.0.0.1',
            port: 3001
        },
        auth: 'Basic: 1234567890abcdef',
        debug: true
    },
    mds;

describe('mds-wrapper', function () {
    before(function () {
        mds = new MDS(options);
        emulator.start(options.get.port, options.post.port);
    });

    after(function () {
        emulator.stop();
    });

    describe('#missed options', function () {
        it('it trow error on missed options', function () {
            try {
                new MDS(null);
            } catch (err) {
                err.message.should.equal('Can\'t initialize mds wrapper. Options undefined.');
            }
        });

        it('it trow error on missed get options', function () {
            try {
                new MDS({});
            } catch (err) {
                err.message.should.equal('Can\'t initialize mds wrapper. Options for read data requests undefined.');
            }
        });

        it('it trow error on missed post options', function () {
            try {
                new MDS({ get: {} });
            } catch (err) {
                err.message.should.equal('Can\'t initialize mds wrapper. Options for write data requests undefined.');
            }
        });
    });

    describe('#default options', function () {
        var mds1 = new MDS({ get: {}, post: {} }),
            mds2 = new MDS({ host: 'myhost', get: {}, post: {} });

        it('it should use default options', function () {
            mds1._options.get.host.should.equal('127.0.0.1');
            mds1._options.post.host.should.equal('127.0.0.1');
            mds1._options.get.port.should.equal(80);
            mds1._options.post.port.should.equal(1111);
        });

        it('it should use common host for get and post requests', function () {
            mds2._options.get.host.should.equal('myhost');
            mds2._options.post.host.should.equal('myhost');
        });
    });

    describe('#test full url retrieve', function () {
        it('it should return valid full url for given key of record', function () {
            mds.getFullUrl(key1).should.equal('http://' + options.get.host + ':' + options.get.port +
            '/get-' + options.namespace + '/' + key1);
        });
    });

    describe('#before write', function () {
        it('it shouldn\'t be any data', function (done) {
            mds.read(key1, function (error, body) {
                should.not.exist(error);
                should(body).not.be.ok;
                done();
            });
        });
        it('it shouldn\'t be any data', function (done) {
            mds.readP(key2).then(function (body) {
                should(body).not.be.ok;
                done();
            });
        });
    });

    describe('#write', function () {
        it('it should write correctly (callback)', function (done) {
            mds.write(key1, value, function (error, body) {
                done();
            });
        });

        it('it should write correctly (promise)', function (done) {
            mds.writeP(key2, value).then(function (body) {
                done();
            });
        });
    });

    describe('#after write', function () {
        it('it should be present in storage (callback)', function (done) {
            mds.read(key1, function (error, body) {
                should.not.exist(error);
                should.exist(body);
                body.should.equal(value);
                done();
            });
        });

        it('it should be present in storage (promise)', function (done) {
            mds.readP(key2).then(function (body) {
                should.exist(body);
                body.should.equal(value);
                done();
            });
        });
    });

    describe('#remove', function () {
        it('it should remove correctly (callback)', function (done) {
            mds.remove(key1, function (error, body) {
                done();
            });
        });

        it('it should remove correctly (promise)', function (done) {
            mds.removeP(key2).then(function (body) {
                done();
            });
        });
    });

    describe('#after remove', function () {
        it('it shouldn\'t be any data', function (done) {
            mds.read(key1, function (error, body) {
                should.not.exist(error);
                should(body).not.be.ok;
                done();
            });
        });
        it('it shouldn\'t be any data', function (done) {
            mds.readP(key2).then(function (body) {
                should(body).not.be.ok;
                done();
            });
        });
    });

    // test error responses
    describe('#test 400 status', function () {
        it('it should return 400 for invalid request (callback)', function (done) {
            mds.read(null, function (error, body) {
                should.exist(error);
                error.message.should.equal('Invalid request');
                should(body).not.be.ok;
                done();
            });
        });

        it('it should return 400 for invalid request (promise)', function (done) {
            mds.readP(null).fail(function (error) {
                should.exist(error);
                error.message.should.equal('Invalid request');
                done();
            });
        });
    });

    // test error responses
    describe('#test 401 status', function () {
        var options1 = {
                namespace: options.namespace,
                get: options.get,
                post: options.post,
                debug: options.debug
            },
            mds1 = new MDS(options1);

        it('it should return 401 for missed auth header (callback)', function (done) {
            mds1.write(key1, value, function (error, body) {
                should.exist(error);
                error.message.should.equal('Auth headers missed or invalid');
                should(body).not.be.ok;
                done();
            });
        });

        it('it should return 401 for missed auth header  (promise)', function (done) {
            mds1.writeP(key2, value).fail(function (error) {
                should.exist(error);
                error.message.should.equal('Auth headers missed or invalid');
                done();
            });
        });
    });

    // test error responses
    describe('#test 507 status', function () {
        it('it should return 507 for fulfilled storage (callback)', function (done) {
            mds.write('-1', value, function (error, body) {
                should.exist(error);
                error.message.should.equal('No empty space in MDS storage');
                should(body).not.be.ok;
                done();
            });
        });

        it('it should return 507 for fulfilled storage (promise)', function (done) {
            mds.writeP('-1', value).fail(function (error) {
                should.exist(error);
                error.message.should.equal('No empty space in MDS storage');
                done();
            });
        });
    });

    // test error responses
    describe('#test 50x status', function () {
        it('it should return 50x for internal storage error (callback)', function (done) {
            mds.write('-2', value, function (error, body) {
                should.exist(error);
                error.message.should.equal('MDS internal error');
                should(body).not.be.ok;
                done();
            });
        });

        it('it should return 50x for internal storage error (promise)', function (done) {
            mds.writeP('-2', value).fail(function (error) {
                should.exist(error);
                error.message.should.equal('MDS internal error');
                done();
            });
        });
    });

    // test error on request
    describe('#test error on request', function () {
        var options1 = {
                namespace: options.namespace,
                get: {
                    host: 'invalid',
                    port: options.get.port
                },
                post: options.post,
                debug: options.debug
            },
            mds1 = new MDS(options1);

        it('it should return error on request', function (done) {
            mds1.read(key1, function (error, body) {
                should.exist(error);
                error.message.should.equal('getaddrinfo ENOTFOUND');
                should(body).not.be.ok;
                done();
            });
        });

        it('it should return error on request (promise)', function (done) {
            mds1.readP(key2).fail(function (error) {
                should.exist(error);
                error.message.should.equal('getaddrinfo ENOTFOUND');
                done();
            });
        });
    });
});
