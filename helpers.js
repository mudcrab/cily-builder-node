var fs = require('fs');
var path = require('path');
var config = require('./config');

exports.mkdirpSync = function (dirpath) 
{
	var parts = dirpath.split(path.sep);

	for( var i = 1; i <= parts.length; i++ )
	{
		try
		{
			fs.mkdirSync( path.join.apply(null, parts.slice(0, i)) );
		}
		catch(e)
		{
			// 
		}
	}
};

exports.getBuilder = function()
{
	for(var i = 0; i < config.builders.length; i++)
	{
		if(config.builders[i].status === 'available')
			return config.builders[i];
	}
};

exports.socketData = function(type, data)
{
	return JSON.stringify({
		type: type,
		data: data || {}
	});
};