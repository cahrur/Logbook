const { knex } = require('../config/database');
const { insertRow } = require('../utils/db');

const TABLE = 'files';
const COLUMNS = [
  'f.id',
  'f.module_id',
  'f.uploaded_by',
  'f.original_name',
  'f.stored_name',
  'f.mime_type',
  'f.size_bytes',
  'f.created_at',
];

module.exports = {
  listByModule(moduleId) {
    return knex(`${TABLE} as f`)
      .leftJoin('users as u', 'f.uploaded_by', 'u.id')
      .select(...COLUMNS, 'u.name as uploader_name')
      .where('f.module_id', moduleId)
      .orderBy('f.created_at', 'desc');
  },

  findById(id) {
    return knex(TABLE).where({ id }).first();
  },

  create(data) {
    return insertRow(TABLE, data);
  },

  remove(id) {
    return knex(TABLE).where({ id }).del();
  },
};
