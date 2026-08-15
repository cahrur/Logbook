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
    .leftJoin('modules as m', 'i.module_id', 'm.id')
    .select(...COLUMNS, 'a.name as assignee_name', 'c.name as creator_name', 'm.name as module_name');
}

module.exports = {
  // filters: { moduleId, assigneeId }
  list(filters = {}) {
    const q = baseQuery();
    if (filters.moduleId) q.where('i.module_id', filters.moduleId);
    if (filters.assigneeId) q.where('i.assignee_id', filters.assigneeId);
    return q.orderBy('i.id', 'desc');
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
