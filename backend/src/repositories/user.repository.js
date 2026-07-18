const { knex } = require('../config/database');
const { insertRow } = require('../utils/db');

const TABLE = 'users';
const PUBLIC_COLUMNS = ['id', 'name', 'email', 'role', 'created_at', 'updated_at'];

module.exports = {
  findByEmail(email) {
    return knex(TABLE).where({ email }).first();
  },

  findById(id) {
    return knex(TABLE).select(PUBLIC_COLUMNS).where({ id }).first();
  },

  create(data) {
    return insertRow(TABLE, data, PUBLIC_COLUMNS);
  },

  list() {
    return knex(TABLE).select(PUBLIC_COLUMNS).orderBy('id', 'asc');
  },

  setRole(id, role) {
    return knex(TABLE).where({ id }).update({ role, updated_at: knex.fn.now() });
  },

  // Minimal list of users for assignment dropdowns (any authenticated role).
  listBasic() {
    return knex(TABLE).select('id', 'name', 'role').orderBy('name', 'asc');
  },

  async count() {
    const row = await knex(TABLE).count('* as c').first();
    return Number(row.c);
  },
};
