'use strict';

const bunyan = require('bunyan');
const PrettyStream = require('bunyan-prettystream');
const pkg = require('./package');

const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

const logger = bunyan.createLogger({
    name: pkg.name,
    stream: prettyStdOut,
    serializers: bunyan.stdSerializers,
    level: 'debug'
});

module.exports = logger;
