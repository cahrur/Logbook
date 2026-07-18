const { knex } = require('../config/database');
const { insertRow, updateRow } = require('../utils/db');

const TABLE = 'module_infos';
const COLUMNS = [
  'i.id',
  'i.module_id',
  'i.created_by',
  'i.title',
  'i.description',
  'i.link',
  'i.created_at',
  'i.updated_at',
];

module.exports = {
  listByModule(moduleId) {
    return knex(`${TABLE} as i`)
      .leftJoin('users as u', 'i.created_by', 'u.id')
      .select(...COLUMNS, 'u.name as creator_name')
      .where('i.module_id', moduleId)
      .orderBy('i.id', 'desc');
  },

  findById(id) {
    return knex(TABLE).where({ id }).first();
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
