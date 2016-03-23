# node-timeoutengine

Simple node module to find the 99%ile timeout value.

```javascript
var wreck = require('wreck');
var timeoutengine = require('timeoutengine');


var defaultTimeout = 5000;
var serviceName = 'httpbin_get';

 function makeServiceCall(callback) {
    var options = {
        timeout: timeoutengine.getSocketTimeout(serviceName) || defaultTimeout
    };
    var reqStart = Date.now();
    var req = wreck.get('http://httpbin.org/get', options, function (err, response, payload) {

        timeoutengine.addSocketDuration(serviceName, Date.now() - reqStart);    //pumping the socket duration

        if (!err && response && response.statusCode === 200 && payload) {
            //console.log(payload.toString());
            // do something this payload
        }
        callback();
    });
}

```

### Problem statement
 I am making a service call from node and hardcoding a fixed socketTimeout (or connectTimeout) value for the same. I am not sure that is the ideal value I can use?

### TimeoutEngine
 TimeoutEngine has API to feed the connect/socket durations and after let say N (default 100) request start returning the 99%ile + delta value. This is useful if you need adaptive timeout value based on the current server/network conditions.



### API
 - `configure(options)` - [Optional] Use if you want a different default config.
 - `addDuration(key, value)` - Generic addDuration API
 - `getTimeout(key)` - Generic getTimeout API
 - `addConnectDuration(key, value)` - Call this API to feed the connect duration of a service call for successful as well as failed requests.
 - `addSocketDuration(key, value)` - Call this API to feed the socket duration of a service call for successful as well as failed requests.
 - `getConnectTimeout(key)` - Returns this 99%ile + delta connect Timeout value
 - `getSocketTimeout(key)` - Returns this 99%ile + delta socket Timeout value
