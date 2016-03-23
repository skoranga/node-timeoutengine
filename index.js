'use strict';

var Measured = require('measured'),
    LRU = require('lru-cache'),
    debug = require('debuglog')('timeoutengine');

//default config
var config = {
    p99_bar: 100,           //request count bar for considering p99 value
    connect_delta: 20,      //Connect timeout delta
    socket_delta: 1000,     //Socket timeout delta
    cache_size: 5000        //Default cache size
};

var cache;

function initCache() {
    cache && cache.reset();
    cache = LRU(config.cache_size);
}

initCache();

module.exports = {
    configure: function (conf) {    //fn to change config direct
        conf = conf || {};
        config.p99_bar = conf.p99_bar || config.p99_bar;
        if (typeof conf.connect_delta === 'number') {
            config.connect_delta = conf.connect_delta;
        }
        if (typeof conf.socket_delta === 'number') {
            config.socket_delta = conf.socket_delta;
        }

        if (conf.cache_size && conf.cache_size !== config.cache_size) {
            config.cache_size = conf.cache_size;
            initCache();
        }
    },
    addDuration: function (key, value) {
        var cacheObj = cache.get(key);
        if (!cacheObj) {
            cacheObj = {};
            cacheObj.histogram = new Measured.Histogram();
            cacheObj.counter = 0;
            cache.set(key, cacheObj);
        }
        ++cacheObj.counter;
        cacheObj.histogram.update(parseInt(value, 10));
    },
    getTimeout: function (key, delta) {
        var timeout;
        var cacheObj = cache.get(key);
        if (cacheObj) {
            if (cacheObj.counter > config.p99_bar) {
                delta = delta || 0;
                timeout = parseInt(cacheObj.histogram.toJSON().p99, 10) + delta;
                cacheObj.timeout = timeout;
                cacheObj.counter = 0;              //reset counter
                debug('timeout for %s: %d', key, timeout);
            } else {
                timeout = cacheObj.timeout;
            }
        }
        return timeout;
    },
    addConnectDuration: function (key, value) {
        this.addDuration('connect:' + key, value);
    },
    addSocketDuration: function (key, value) {
        this.addDuration('socket:' + key, value);
    },
    getConnectTimeout: function (key) {
        return this.getTimeout('connect:' + key, config.connect_delta);
    },
    getSocketTimeout: function (key) {
        return this.getTimeout('socket:' + key, config.socket_delta);
    }
};
