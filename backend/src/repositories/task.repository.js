const { knex } = require('../config/database');
const { insertRow, updateRow } = require('../utils/db');

const TABLE = 'tasks';
const COLUMNS = [
  't.id',
  't.module_id',
  't.assignee_id',
  't.created_by',
  't.title',
  't.detail',
  't.deadline',
  't.status',
  't.completed_at',
  't.order_index',
  't.created_at',
  't.updated_at',
];

function baseQuery() {
  return knex(`${TABLE} as t`)
    .leftJoin('users as a', 't.assignee_id', 'a.id')
    .leftJoin('users as c', 't.created_by', 'c.id')
    .leftJoin('modules as m', 't.module_id', 'm.id')
    .select(...COLUMNS, 'a.name as assignee_name', 'c.name as creator_name', 'm.name as module_name');
}

module.exports = {
  // filters: { moduleId, assigneeId }
  list(filters = {}) {
    const q = baseQuery();
    if (filters.moduleId) q.where('t.module_id', filters.moduleId);
    if (filters.assigneeId) q.where('t.assignee_id', filters.assigneeId);
    return q.orderBy('t.id', 'desc');
  },

  findById(id) {
    return baseQuery().where('t.id', id).first();
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
