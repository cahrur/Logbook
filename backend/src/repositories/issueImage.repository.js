const { knex } = require('../config/database');
const { insertRow } = require('../utils/db');

const TABLE = 'issue_images';
const COLUMNS = [
  'img.id',
  'img.issue_id',
  'img.uploaded_by',
  'img.original_name',
  'img.stored_name',
  'img.mime_type',
  'img.size_bytes',
  'img.created_at',
];

module.exports = {
  listByIssue(issueId) {
    return knex(`${TABLE} as img`)
      .leftJoin('users as u', 'img.uploaded_by', 'u.id')
      .select(...COLUMNS, 'u.name as uploader_name')
      .where('img.issue_id', issueId)
      .orderBy('img.id', 'asc');
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
