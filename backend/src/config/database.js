const knexLib = require('knex');
const knexConfig = require('../../knexfile');
const config = require('./index');

const knex = knexLib(knexConfig[config.env] || knexConfig.development);

async function runMigrations() {
  const [batch, log] = await knex.migrate.latest();
  if (log.length > 0) {
    console.log(`Migrations applied (batch ${batch}): ${log.join(', ')}`);
  } else {
    console.log('Database already up to date');
  }
}

module.exports = { knex, runMigrations };
