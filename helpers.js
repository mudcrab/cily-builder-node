var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
homeDir += '/.cily';
var fs = require('fs');
var path = require('path');
var cliArgs = require("command-line-args");

var cli = cliArgs([
	{ name: 'init', alias: 'i', type: Boolean, description: 'Initialize config file' },
	{ name: 'server', alias: 's', type: String, description: 'Cily server address' },
	{ name: 'port', alias: 'p', type: Number, description: 'Cily port nr' },
	{ name: 'home', alias: 'h', type: String, description: 'Builds and logs root location' },
	{ name: 'token', alias: 't', type: String, description: 'Auth token' },
	{ name: 'config', alias: 'c', type: String, description: 'Config file' },
	{ name: 'help', type: Boolean, description: 'Print usage instructions' }
]);

var cliUsage = cli.getUsage({
	header: '',
	footer: ''
});

var args = cli.parse();
var config = getConfig();

function getConfig()
{
	var configFile = homeDir + '/builder.js';
	if(args.config)
		configFile = args.config;

	try
	{
		console.log('Using %s', configFile)
		return require(configFile);
	}
	catch(e)
	{
		console.log('Config file %s not found, \nPlease generate one using -init flag', configFile);
		process.exit(-1);
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
exports.args = args;
exports.cliUsage = cliUsage;