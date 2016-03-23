'use strict';

var assert = require('assert'),
    async = require('async'),
    timeoutengine = require('../index');

describe('timeout engine', function () {

    it('initial values', function () {
        assert.ok(!timeoutengine.getConnectTimeout());
        assert.ok(!timeoutengine.getSocketTimeout());
    });

    it('test for 1', function () {
        var socketTimeoutDelta = 50;
        var timeoutDuration = 1000;
        timeoutengine.configure({p99_bar: 1, socket_delta: socketTimeoutDelta});
        timeoutengine.addSocketDuration('a', timeoutDuration);
        timeoutengine.addSocketDuration('a', timeoutDuration);
        assert.ok(timeoutengine.getSocketTimeout('a') === timeoutDuration + socketTimeoutDelta);
    });

    it('test for 100', function () {
        timeoutengine.configure({p99_bar: 100, socket_delta: 1000});

        async.times(101, function (n, next) {
            timeoutengine.addSocketDuration('serv1', n);
            next();
        }, function () {
            assert.ok(timeoutengine.getSocketTimeout('serv1') === 99 + 1000);
        });
    });

    it('test for 100 reverse', function () {
        timeoutengine.configure({p99_bar: 100, socket_delta: 1000});

        async.times(101, function (n, next) {
            timeoutengine.addSocketDuration('serv2', 200 - n);
            next();
        }, function () {
            assert.ok(timeoutengine.getSocketTimeout('serv2') === 199 + 1000);
        });
    });


    it('test for 10k', function () {
        timeoutengine.configure({p99_bar: 100, socket_delta: 1000});

        async.times(10005, function (n, next) {
            timeoutengine.addSocketDuration('serv3', 100);
            next();
        }, function () {
            assert.ok(timeoutengine.getSocketTimeout('serv3') === 100 + 1000);
        });
    });

    it('test for 5k keys: cache test', function () {
        timeoutengine.configure({p99_bar: 1, socket_delta: 1000});

        async.times(5005, function (n, next) {
            timeoutengine.addSocketDuration('name' + n, 100);
            timeoutengine.addSocketDuration('name' + n, 100);
            next();
        }, function () {
            assert.ok(!timeoutengine.getSocketTimeout('name1'));    //this will overflow
            assert.ok(timeoutengine.getSocketTimeout('name5000'));
        });
    });
});
