var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:1337');
var helpers = require('./helpers');
var db = require('./db.js');
var appRoot = require('app-root-path');
var Promise_ = require('bluebird');
var Moment = require('moment-timezone');
var exec = require('child_process').exec;
var fs = require('fs');
var clone = require('nodegit').Clone.clone;

var Builder = function()
{
	this.status = 'available';
	this.initSocket();
	console.log('Builder online');
};

Builder.prototype.initSocket = function()
{
	var self = this;

	ws.on('open', function() {
		ws.send(helpers.socketData('addBuilder', null));
	});

	ws.on('message', function(data) {
		var message = JSON.parse(data) || { type: 'none' };
		
		switch(message.type)
		{
			case 'build':
				self.build(message.data.project, message.data.task, message.data.build);
			break;

			case 'getStatus':
				ws.send(helpers.socketData('status', self.status));
			break;

			default:
				console.log('Unknown action: %s', message.type);
			break;
		}
	});
};

Builder.prototype.build = function(project, task, build)
{
	var self = this;

	this.projectName = project.name;
	this.buildNr = build.build_nr;

	var repoLocation = helpers.config.builds + project.name + '/' + build.build_nr;

	clone(project.repo_address, repoLocation, null)
	.then(function(repo) {
		return repo.getBranchCommit('master');
	})
	.then(function(commit) {
		self.runCommands(repoLocation, task.cmd.split('\n'))
		.then(function(buildStatus) {
			var retData = {
				status: buildStatus,
				end_time: Moment.tz("Europe/Tallinn").format("YYYY-MM-DD HH:MM:ss"),
				commit: commit.sha()
			};
			ws.send(helpers.socketData('buildComplete', retData));
		});
	})
	.catch(function(err) {
		ws.send(helpers.socketData('vcsError', null));
	});
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
	var logsLocation = helpers.config.logs + this.projectName;

	try
	{
		fs.mkdirSync(logsLocation);
	}
	catch(e)
	{
		console.log(e);
	}

	fs.appendFile(helpers.config.logs + this.projectName + '/' + this.buildNr + '.log', msg, function (err) {
		// log error
	});
};

new Builder();