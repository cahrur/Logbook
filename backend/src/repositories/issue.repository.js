const { knex } = require('../config/database');
const { insertRow, updateRow } = require('../utils/db');

const TABLE = 'issues';
const COLUMNS = [
  'i.id',
  'i.module_id',
  'i.assignee_id',
  'i.created_by',
  'i.title',
  'i.description',
  'i.priority',
  'i.status',
  'i.deadline',
  'i.created_at',
  'i.updated_at',
];

function baseQuery() {
  return knex(`${TABLE} as i`)
    .leftJoin('users as a', 'i.assignee_id', 'a.id')
    .leftJoin('users as c', 'i.created_by', 'c.id')
    .select(...COLUMNS, 'a.name as assignee_name', 'c.name as creator_name');
}

module.exports = {
  listByModule(moduleId) {
    return baseQuery().where('i.module_id', moduleId).orderBy('i.id', 'desc');
  },

  findById(id) {
    return baseQuery().where('i.id', id).first();
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
