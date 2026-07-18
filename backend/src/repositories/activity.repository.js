const { knex } = require('../config/database');
const { insertRow, updateRow } = require('../utils/db');

const TABLE = 'activities';
const COLUMNS = [
  'a.id',
  'a.created_by',
  'a.module_id',
  'a.activity_date',
  'a.title',
  'a.description',
  'a.category',
  'a.duration_minutes',
  'a.directive_type',
  'a.directive_from',
  'a.due_date',
  'a.completed_at',
  'a.created_at',
  'a.updated_at',
];

function baseQuery() {
  return knex(`${TABLE} as a`)
    .leftJoin('modules as m', 'a.module_id', 'm.id')
    .leftJoin('users as u', 'a.created_by', 'u.id')
    .select(...COLUMNS, 'm.name as module_name', 'u.name as author_name');
}

module.exports = {
  // Filters: { moduleId, category, directiveType, createdBy, dateFrom, dateTo, limit }
  list(filters = {}) {
    const q = baseQuery();
    if (filters.moduleId) q.where('a.module_id', filters.moduleId);
    if (filters.category) q.where('a.category', filters.category);
    if (filters.directiveType) q.where('a.directive_type', filters.directiveType);
    if (filters.createdBy) q.where('a.created_by', filters.createdBy);
    if (filters.dateFrom) q.where('a.activity_date', '>=', filters.dateFrom);
    if (filters.dateTo) q.where('a.activity_date', '<=', filters.dateTo);
    if (filters.search) {
      const term = `%${filters.search}%`;
      // Match the search term against title OR description (case-insensitive).
      q.where((b) => b.whereILike('a.title', term).orWhereILike('a.description', term));
    }
    if (filters.isTask === true) q.whereNotNull('a.due_date');
    if (filters.taskStatus === 'done') q.whereNotNull('a.completed_at');
    if (filters.taskStatus === 'todo') {
      q.whereNotNull('a.due_date').whereNull('a.completed_at');
    }
    q.orderBy('a.activity_date', 'desc').orderBy('a.id', 'desc');
    if (filters.limit) q.limit(filters.limit);
    return q;
  },

  findById(id) {
    return baseQuery().where('a.id', id).first();
  },

  // Raw row without joins — used for ownership checks.
  findRawById(id) {
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

  async countBetween(dateFrom, dateTo, category) {
    const q = knex(TABLE)
      .where('activity_date', '>=', dateFrom)
      .andWhere('activity_date', '<=', dateTo);
    if (category) q.andWhere('category', category);
    const row = await q.count('* as c').first();
    return Number(row.c);
  },
};
