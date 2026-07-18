const { knex } = require('../config/database');
const { insertRow, updateRow } = require('../utils/db');

const TABLE = 'modules';
const COLUMNS = [
  'm.id',
  'm.name',
  'm.description',
  'm.status',
  'm.progress',
  'm.pic_user_id',
  'm.order_index',
  'm.start_date',
  'm.target_date',
  'm.created_at',
  'm.updated_at',
];

function mapCounts(row) {
  return { ...row, activity_count: Number(row.activity_count || 0) };
}

module.exports = {
  // Single query with join + group by — avoids N+1 for the activity counter.
  async list() {
    const rows = await knex(`${TABLE} as m`)
      .leftJoin('users as u', 'm.pic_user_id', 'u.id')
      .leftJoin('activities as a', 'a.module_id', 'm.id')
      .select(...COLUMNS, 'u.name as pic_name')
      .count('a.id as activity_count')
      .groupBy(...COLUMNS, 'u.name')
      .orderBy('m.order_index', 'asc');
    return rows.map(mapCounts);
  },

  async findById(id) {
    // Correlated subquery for the count so we can select the large `about`
    // text column without grouping by it.
    const activityCount = knex('activities')
      .whereRaw('activities.module_id = m.id')
      .count('*')
      .as('activity_count');
    const row = await knex(`${TABLE} as m`)
      .leftJoin('users as u', 'm.pic_user_id', 'u.id')
      .select(...COLUMNS, 'm.about', 'u.name as pic_name', activityCount)
      .where('m.id', id)
      .first();
    return row ? mapCounts(row) : null;
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
