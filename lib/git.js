var _ = require('lodash');
var exec = require('child_process').exec;
var fs = require('fs');
var Promise = require('bluebird');

var Git = function(path, folder)
{
	this.path = path;
	this.folder = folder;
	this.logs = [];

	this.execOpts = {
		cwd: this.path,
		encoding: 'utf8'
	};

	console.log(this.path)
};

Git.prototype.clone = function(repo, cb)
{
	var self = this;

	return new Promise(function(resolve) {
		exec('git clone ' + repo + ' ' + self.folder, self.execOpts, function(error, stdout, stderr) {
			// console.log(error, stdout, stderr);

			resolve();
		});
	});
};

Git.prototype.update = function()
{
	var self = this;

	// var opts = _.extend(this.execOpts, {
	// 	cwd: self.path + '/cily-web'
	// });

	return new Promise(function(resolve) {
		exec('git pull', self.execOpts, function(error, stdout, stderr) {
			resolve();
		});
	})
};

Git.prototype.log = function()
{
	var self = this;

	// var opts = _.extend(this.execOpts, {
	// 	cwd: self.path + '/cily-web'
	// });

	return new Promise(function(resolve) {
		exec('git log --pretty=format:"%H|%h|%an|%ad|%s"', self.execOpts, function(error, stdout, stderr) {
			if(stdout)
			{
				this.logs = [];

				var logLines = stdout.split('\n');

				logLines.forEach(function(log) {
					var log = log.split('|');

					self.logs.push({
						hash: log[0],
						shortHash: log[1],
						author: log[2],
						date: log[3],
						message: log[4]
					});

				});

				resolve(self.logs);
			}
			else
				resolve(false);
		});
	});
};

module.exports = Git;