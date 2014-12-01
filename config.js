var appRoot = require('app-root-path');

module.exports = {
	events: {},
	builderServer: {},
	
	base: {
		port: 3000,
	},

	db: {
		server: 'localhost',
		username: 'redoit',
		password: 'redoit',
		db: 'redoit',
		connection: null,
		models: {}
	},

	build: {
		dir: appRoot + '/builds/'
	}
};