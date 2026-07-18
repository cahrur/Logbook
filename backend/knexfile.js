const config = require('./src/config');

const client = config.db.client;
const isSqlite = client.includes('sqlite');
const isMysql = client.includes('mysql');

// Return DATE columns as plain 'YYYY-MM-DD' strings instead of JS Date objects,
// so a stored date never shifts a day when serialized across timezones.
if (client === 'pg' || client === 'postgresql') {
  // eslint-disable-next-line global-require
  const pg = require('pg');
  pg.types.setTypeParser(1082, (value) => value); // 1082 = DATE oid
}

// PostgreSQL/MySQL use key-value connection; SQLite uses a file path (DB_NAME).
const connection = isSqlite
  ? { filename: config.db.database || './dev.sqlite3' }
  : {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
      // mysql2: keep DATE as string (DATETIME/TIMESTAMP stay as Date objects).
      ...(isMysql ? { dateStrings: ['DATE'] } : {}),
    };

const base = {
  client,
  connection,
  useNullAsDefault: isSqlite,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
};

module.exports = {
  development: {
    ...base,
    pool: { min: 1, max: 5 },
  },
  production: {
    ...base,
    pool: { min: 2, max: 10 },
  },
};
