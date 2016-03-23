'use strict';

var assert = require('assert'),
    async = require('async'),
    wreck = require('wreck'),
    timeoutengine = require('../index');

describe('timeout engine for wreck', function () {

    before(function () {
        timeoutengine.configure({p99_bar: 10, socket_delta: 500});
    });

    it('adaptive timeout test', function (callback) {
        this.timeout(20000);
        var defaultTimeout = 5000;
        var serviceName = 'httpbin_get';
        async.times(15, function (n, next) {
            var options = {
                timeout: timeoutengine.getSocketTimeout(serviceName) || defaultTimeout
            };
            var reqStart = Date.now();
            var req = wreck.get('http://httpbin.org/get', options, function (err, response, payload) {

                timeoutengine.addSocketDuration(serviceName, Date.now() - reqStart);    //adding the socket duration

                if (!err && response && response.statusCode === 200 && payload) {
                    //console.log(payload.toString());
                    // do something this payload
                }
                next();
            });

        }, function () {
            assert.ok(timeoutengine.getSocketTimeout(serviceName));
            assert.ok(timeoutengine.getSocketTimeout(serviceName) < defaultTimeout);    //New adapted value will be less
            callback();
        });
    });
});
