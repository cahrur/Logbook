const { knex } = require('../config/database');
const config = require('../config');

// Only PostgreSQL-family clients support INSERT/UPDATE ... RETURNING.
// MySQL and SQLite need an insertId + follow-up SELECT instead.
const RETURNING_CLIENTS = ['pg', 'postgresql', 'cockroachdb', 'pg-native'];
const supportsReturning = RETURNING_CLIENTS.includes(config.db.client);

async function insertRow(table, data, select) {
  if (supportsReturning) {
    const [row] = await knex(table).insert(data).returning(select || '*');
    return row;
  }
  const [id] = await knex(table).insert(data);
  const query = knex(table).where({ id });
  return select ? query.select(select).first() : query.first();
}

async function updateRow(table, id, data, select) {
  const patch = { ...data, updated_at: knex.fn.now() };
  if (supportsReturning) {
    const [row] = await knex(table).where({ id }).update(patch).returning(select || '*');
    return row || null;
  }
  const affected = await knex(table).where({ id }).update(patch);
  if (!affected) return null;
  const query = knex(table).where({ id });
  return select ? query.select(select).first() : query.first();
}

module.exports = { insertRow, updateRow, supportsReturning };
