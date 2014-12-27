var _ = require('lodash');

var exec = require('child_process').exec;
var fs = require('fs');
var Promise = require('bluebird');


module.exports = {
	Git: require('./git')
};