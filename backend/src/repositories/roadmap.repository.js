const { knex } = require('../config/database');
const { insertRow, updateRow } = require('../utils/db');

const TABLE = 'roadmap_steps';
const COLUMNS = [
  'id',
  'module_id',
  'title',
  'description',
  'status',
  'target_date',
  'order_index',
  'created_at',
  'updated_at',
];

module.exports = {
  listByModule(moduleId) {
    return knex(TABLE)
      .select(COLUMNS)
      .where({ module_id: moduleId })
      .orderBy('order_index', 'asc')
      .orderBy('id', 'asc');
  },

  findById(id) {
    return knex(TABLE).select(COLUMNS).where({ id }).first();
  },

  create(data) {
    return insertRow(TABLE, data);
  },

  update(id, data) {
    return updateRow(TABLE, id, data);
  },

  remove(id) {
    return knex(TABLE).where({ id }).del();
  },
};
