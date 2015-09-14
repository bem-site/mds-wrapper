var fs = require('fs'),
    fsExtra = require('fs-extra'),
    should = require('should'),
    nock = require('nock'),

    MDS = require('../index.js');

function getOptions() {
    return {
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
        debug: false
    };
}

describe('mds-wrapper', function () {
    beforeEach(function () {
        fsExtra.ensureDirSync('./tmp');
    });

    afterEach(function () {
        fsExtra.removeSync('./tmp');
    });

    describe('it should throw error on', function () {
        it('missed options', function () {
            (function () { new MDS(null); }).should.throw('Can\'t initialize mds wrapper. Options undefined.');
        });

        it('missed get options', function () {
            (function () { new MDS({}); })
                .should.throw('Can\'t initialize mds wrapper. Options for read data requests undefined.');
        });

        it('missed post options', function () {
            (function () { new MDS({ get: {} }); })
                .should.throw('Can\'t initialize mds wrapper. Options for write data requests undefined.');
        });
    });

    describe('options passing', function () {
        it('it should use default options', function () {
            var mds = new MDS({ get: {}, post: {} });
            mds.getOptions().get.host.should.equal('127.0.0.1');
            mds.getOptions().post.host.should.equal('127.0.0.1');
            mds.getOptions().get.port.should.equal(80);
            mds.getOptions().post.port.should.equal(1111);
        });

        it('it should use common host for get and post requests', function () {
            var mds = new MDS({ host: 'myhost', get: {}, post: {} });
            mds.getOptions().get.host.should.equal('myhost');
            mds.getOptions().post.host.should.equal('myhost');
        });
    });

    describe('it should build valid full url string', function () {
        it('it should return valid full url for given key of record', function () {
            var key = 'test/unique/key.html',
                mds = new MDS(getOptions());
            mds.getFullUrl(key).should.equal('http://' + getOptions().get.host + ':' + getOptions().get.port +
            '/get-' + getOptions().namespace + '/' + key);
        });
    });

    describe('read', function () {
        it('should read data and return it in callback if exists in storage for given key', function (done) {
            nock('http://127.0.0.1:3000')
                .get('/get-my-site/key')
                .reply(200, 'Hello World');

            var mds = new MDS(getOptions());
            mds.read('key', function (error, data) {
                should.not.exist(error);
                data.should.equal('Hello World');
                done();
            });
        });

        it('should read data and return it in promise if exists in storage for given key', function () {
            nock('http://127.0.0.1:3000')
                .get('/get-my-site/key')
                .reply(200, 'Hello World');

            var mds = new MDS(getOptions());
            return mds.read('key').then(function (data) {
                data.should.equal('Hello World');
            });
        });

        it('should read value as stream as save file on filesystem', function (done) {
            nock('http://127.0.0.1:3000')
                .get('/get-my-site/key')
                .replyWithFile(200, __dirname + '/fixture.json');

            (new MDS(getOptions()))
                .readToStream('key')
                .pipe(fs.createWriteStream('./tmp/fixture.json'))
                .on('finish', function () {
                    fs.existsSync('./tmp/fixture.json').should.equal(true);
                    var initial = fsExtra.readJSONSync('./test/fixture.json'),
                        output = fsExtra.readJSONSync('./tmp/fixture.json');
                    should.deepEqual(initial, output);
                    done();
                });
        });

        describe('error cases', function () {
            it('should return callback with error if ETIMEOUT network error occur', function (done) {
                nock('http://127.0.0.1:3000')
                    .get('/get-my-site/key')
                    .replyWithError({ 'message': 'timeout', code: 'ETIMEDOUT' });

                var mds = new MDS(getOptions());
                mds.read('key', function (error, data) {
                    error.code.should.equal('ETIMEDOUT');
                    should.not.exist(data);
                    done();
                });
            });

            it('should return callback with null data if it does not exists for given key', function (done) {
                nock('http://127.0.0.1:3000')
                    .get('/get-my-site/key')
                    .reply(404);

                var mds = new MDS(getOptions());
                mds.read('key', function (error, data) {
                    should(data).be.equal(null);
                    done();
                });
            });

            it('should return callback with error in case of invalid request', function (done) {
                nock('http://127.0.0.1:3000')
                    .get('/get-my-site/key')
                    .reply(400);

                var mds = new MDS(getOptions());
                mds.read('key', function (error) {
                    error.message.should.equal('Invalid request');
                    done();
                });
            });

            it('should return callback with error in case of missed auth headers', function (done) {
                nock('http://127.0.0.1:3000')
                    .get('/get-my-site/key')
                    .reply(401);

                var mds = new MDS(getOptions());
                mds.read('key', function (error) {
                    error.message.should.equal('Auth headers missed or invalid');
                    done();
                });
            });

            it('should return callback with error in case of no empty space', function (done) {
                nock('http://127.0.0.1:3000')
                    .get('/get-my-site/key')
                    .reply(507);

                var mds = new MDS(getOptions());
                mds.read('key', function (error) {
                    error.message.should.equal('No empty space in MDS storage');
                    done();
                });
            });

            it('should return callback with error in case of MDS internal error', function (done) {
                nock('http://127.0.0.1:3000')
                    .get('/get-my-site/key')
                    .reply(503);

                var mds = new MDS(getOptions());
                mds.read('key', function (error) {
                    error.message.should.equal('MDS internal error');
                    done();
                });
            });
        });
    });

    describe('write', function () {
        it('should write data and return result in callback', function (done) {
            nock('http://127.0.0.1:3001')
                .post('/upload-my-site/key', 'Hello World')
                .reply(200, 'OK');

            var mds = new MDS(getOptions());
            mds.write('key', 'Hello World', function (error, data) {
                should.not.exist(error);
                data.should.equal('OK');
                done();
            });
        });

        it('should write data and return result in promise', function () {
            nock('http://127.0.0.1:3001', 'Hello World')
                .post('/upload-my-site/key')
                .reply(200, 'OK');

            var mds = new MDS(getOptions());
            return mds.write('key', 'Hello World').then(function (data) {
                data.should.equal('OK')
            });
        });

        it('should write streamed data from file', function (done) {
            var body;
            nock('http://127.0.0.1:3001', 'Hello World')
                .post('/upload-my-site/key')
                .reply(200, function(uri, requestBody) {
                    body = requestBody;
                });

            var mds = new MDS(getOptions());
            mds
                .writeFromStream('key', fs.createReadStream('./test/fixture.json'))
                .on('end', function () {
                    var initial = fsExtra.readJSONSync('./test/fixture.json');
                    should.deepEqual(initial, JSON.parse(body));
                    done();
                });
        });

        describe('error cases', function () {
            it('should return callback with error if ETIMEOUT network error occur', function (done) {
                nock('http://127.0.0.1:3001')
                    .post('/upload-my-site/key', 'Hello World')
                    .replyWithError({ 'message': 'timeout', code: 'ETIMEDOUT' });

                var mds = new MDS(getOptions());
                mds.write('key', 'Hello World', function (error, data) {
                    error.code.should.equal('ETIMEDOUT');
                    should.not.exist(data);
                    done();
                });
            });

            it('should return callback with error in case of invalid request', function (done) {
                nock('http://127.0.0.1:3001')
                    .post('/upload-my-site/key', 'Hello World')
                    .reply(400);

                var mds = new MDS(getOptions());
                mds.write('key', 'Hello World', function (error) {
                    error.message.should.equal('Invalid request');
                    done();
                });
            });

            it('should return callback with error in case of missed auth headers', function (done) {
                nock('http://127.0.0.1:3001')
                    .post('/upload-my-site/key', 'Hello World')
                    .reply(401);

                var mds = new MDS(getOptions());
                mds.write('key', 'Hello World', function (error) {
                    error.message.should.equal('Auth headers missed or invalid');
                    done();
                });
            });

            it('should return callback with error in case of no empty space', function (done) {
                nock('http://127.0.0.1:3001')
                    .post('/upload-my-site/key', 'Hello World')
                    .reply(507);

                var mds = new MDS(getOptions());
                mds.write('key', 'Hello World', function (error) {
                    error.message.should.equal('No empty space in MDS storage');
                    done();
                });
            });

            it('should return callback with error in case of MDS internal error', function (done) {
                nock('http://127.0.0.1:3001')
                    .post('/upload-my-site/key', 'Hello World')
                    .reply(503);

                var mds = new MDS(getOptions());
                mds.write('key', 'Hello World', function (error) {
                    error.message.should.equal('MDS internal error');
                    done();
                });
            });
        });
    });

    describe('remove', function () {
        it('should remove data and return result in callback', function (done) {
            nock('http://127.0.0.1:3001')
                .get('/delete-my-site/key')
                .reply(200, 'OK');

            var mds = new MDS(getOptions());
            mds.remove('key', function (error, data) {
                should.not.exist(error);
                data.should.equal('OK');
                done();
            });
        });

        it('should remove data and return result in promise', function () {
            nock('http://127.0.0.1:3001')
                .get('/delete-my-site/key')
                .reply(200, 'OK');

            var mds = new MDS(getOptions());
            return mds.remove('key').then(function (data) {
                data.should.equal('OK')
            });
        });
    });
});
