'use strict';

const got = require('got');
const pkg = require('./package');

function extendOptions(options) {
    options.retries = 0;
    options.timeout = options.timeout === undefined ? 5000 : options.timeout;
    // Unconnet next line for IPv6 only network
    // options.family  = options.family  || 6;
    options.headers = options.headers || {};
    options.headers['user-agent'] = pkg.name + '/' + pkg.version;
}

function wrapper(url, opts) {
    opts = opts || {};
    extendOptions(opts);
    return got(url, opts);
}

module.exports = wrapper;
