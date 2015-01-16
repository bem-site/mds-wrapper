var should = require('should'),

    mds = require('../index.js'),
    key1 = 'test/unique/key1',
    key2 = 'test/unique/key2',
    value = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed ' +
        'do eiusmod tempor incididunt ut labore et dolore magna aliqua',

    options = {
        host: 'localhost',
        namespace: 'my-site',
        get: { port: 80 },
        post: { port: 1111 },
        auth: ''
    };

describe('mds-wrapper', function () {
    before(function () {
        mds.init(options);
    });

    describe('#before write', function () {
        it('it shouldn\'t be any data', function (done) {
            mds.read(key1, function(error, body) {
                should.not.exist(error);
                should(body).not.be.ok;
                done();
            });
        });
        it('it shouldn\'t be any data', function (done) {
            mds.read(key2, null).then(function(body) {
                should(body).not.be.ok;
                done();
            });
        });
    });

    describe('#write', function () {
        it('it should write correctly (callback)', function (done) {
            mds.write(key1, value, function(error, body) {
                done();
            });
        });

        it('it should write correctly (promise)', function (done) {
            mds.write(key2, value, null).then(function(body) {
                done();
            });
        });
    });

    describe('#after write', function () {
        it('it should be present in storage (callback)', function (done) {
            mds.read(key1, function(error, body) {
                should.not.exist(error);
                should.exist(body);
                body.should.equal(value);
                done();
            });
        });

        it('it should be present in storage (promise)', function (done) {
            mds.read(key2, null).then(function(body) {
                should.exist(body);
                body.should.equal(value);
                done();
            });
        });
    });

    describe('#remove', function () {
        it('it should remove correctly (callback)', function (done) {
            mds.remove(key1, function(error, body) {
                done();
            });
        });

        it('it should remove correctly (promise)', function (done) {
            mds.remove(key2, null).then(function(body) {
                done();
            });
        });
    });

    describe('#after remove', function () {
        it('it shouldn\'t be any data', function (done) {
            mds.read(key1, function(error, body) {
                should.not.exist(error);
                should(body).not.be.ok;
                done();
            });
        });
        it('it shouldn\'t be any data', function (done) {
            mds.read(key2, null).then(function(body) {
                should(body).not.be.ok;
                done();
            });
        });
    });
});
