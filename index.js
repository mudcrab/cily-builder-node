var WebSocket = require('ws');
var helper = require('./helpers');
var Promise_ = require('bluebird');
var Moment = require('moment-timezone');
var exec = require('child_process').exec;
var fs = require('fs');
var scm = require('./lib/scm');
var ws;

function initConfig()
{
	var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
	homeDir += '/.cily';
	homeDir = helper.args.home || homeDir;

	var config = 
	[
		'	serverAddress: "' + (helper.args.server || 'localhost') + '"',
		'port: ' + (helper.args.port || 1337),
		'token: "' + (helper.args.token || '123456') + '"',
		'logs: "' + homeDir + '/logs/"',
		'builds: "' + homeDir + '/builds/"'
	];

	try
	{
		console.log('\nmodule.exports = {\n' + config.join(',\n	') + '\n};');
		console.log('\nWriting config file to: %s/builder.js', homeDir);

		fs.writeFileSync(homeDir + '/builder.js', 'module.exports = {\n' + config.join(',\n	') + '\n};', {
			encoding: 'utf8'
		});

		console.log('Done');
	}
	catch(e)
	{
		console.log('Error writing config file.');
	}
	process.exit(0);
};

if(helper.args.init)
	initConfig();

if(helper.args.help)
{
	console.log(helper.cliUsage);
	process.exit(0);
}

var Builder = function()
{
	this.status = 'available';
	this.timeout = 0;
	this.socketConnected = false;
	this.ws = null;

	var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
	homeDir += '/.cily';

	helper.config.logs = homeDir + '/logs/';
	helper.config.builds = homeDir + '/builds/';

	this.initSocket();
};

Builder.prototype.initSocket = function()
{
	var self = this;
	ws = new WebSocket('ws://localhost:1337');

	ws.on('open', function() {
		ws.send(helper.socketData('addBuilder', { token: helper.config.token } ));
		self.socketConnected = true;
		console.log('Connected to server');
	});

	ws.on('message', function(data) {
		var message = JSON.parse(data) || { type: 'none' };
		
		switch(message.type)
		{
			case 'build':
				self.build(message.data.project, message.data.task, message.data.build);
			break;

			case 'getStatus':
				ws.send(helper.socketData('status', self.status));
			break;

			default:
				console.log('Unknown action: %s', message.type);
			break;
		}
	});

	ws.on('close', function() {
		console.log('Connection closed');
		self.socketConnected = false;

		if(self.timeout == 0)
		{
			self.retryConnection();
		}
	});
};

Builder.prototype.retryConnection = function()
{
	var self = this;

	this.timeout = setInterval(function() {
		if(!self.socketConnected)
		{
			self.initSocket();
			console.log('Retrying...');
		}
		else
		{
			clearInterval(self.timeout);
			self.timeout = 0;
		}
	}, 2000);
};

Builder.prototype.build = function(project, task, build)
{
	var self = this;

	this.projectName = project.name;
	this.buildNr = build.build_nr;

	var repoLocation = helper.config.builds + project.name + '/';

	try
	{
		fs.mkdirSync(repoLocation);
	}
	catch(e){};

	var git = new scm.Git(repoLocation, build.build_nr);

	repoLocation += build.build_nr;

	git.clone(project.repo_address)
	.then(function() {
		git.log()
		.then(function(log) {
			var log = log[0];

			self.runCommands(repoLocation, task.cmd.split('\n'))
			.then(function(buildStatus) {
				var retData = {
					status: buildStatus,
					end_time: Moment.tz("Europe/Tallinn").format("YYYY-MM-DD HH:MM:ss"),
					hash: log.hash,
					msg: log.message,
					author: log.author,
					committer: log.author
				};
				ws.send(helper.socketData('buildComplete', retData));
			});
		});
	})
};

Builder.prototype.runCommands = function(path, commands)
{
	var self = this;

	return new Promise_(function(resolve) {
		var done = commands.length - 1;
		commands.forEach(function(cmd, i) {
			exec(cmd, { cwd: path }, function(error, stdout, stderr) {
				self.saveLog(stdout);

				if(error)
				{
					resolve(false);
				}
				else
				{
					if(i === done)
						resolve(true);
				}
			});
		});
	});
};

Builder.prototype.saveLog = function(msg)
{
	var self = this;
	var logsLocation = helper.config.logs + this.projectName;

	try
	{
		fs.mkdirSync(logsLocation);
	}
	catch(e)
	{
		// console.log(e);
	}

	fs.appendFile(helper.config.logs + this.projectName + '/' + this.buildNr + '.log', msg, function (err) {
		// log error
	});
};

new Builder();




