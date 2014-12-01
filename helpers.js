var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
homeDir += '/.cily';
var fs = require('fs');
var path = require('path');
var config = getConfig();

function getConfig()
{
	try
	{
		return require(homeDir + '/cily');
	}
	catch(e)
	{
		console.log('Config file at %s/cily.js not found, using the default.', homeDir);
		return require('./config');
	}
};

exports.socketData = function(type, data)
{
	return JSON.stringify({
		type: type,
		data: data || {}
	});
};

exports.getConfig = getConfig;
exports.config = config;
exports.appDir = homeDir;