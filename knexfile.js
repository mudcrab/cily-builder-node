var config = require('./config.js');

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      host: config.db.server,
      user: config.db.username,
      password: config.db.password,
      database: config.db.db,
      charset: 'utf8'
    },
    pool: {
      max: 1
    },
    seeds: {
      directory: './seeds'
    }
  },

  staging: {
    client: 'mysql',
    connection: {
      host: config.db.server,
      user: config.db.username,
      password: config.db.password,
      database: config.db.db,
      charset: 'utf8'
    },
    migrations: {
      tableName: 'migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host: config.db.server,
      user: config.db.username,
      password: config.db.password,
      database: config.db.db,
      charset: 'utf8'
    },
    pool: {
      max: 5
    }
  }

};