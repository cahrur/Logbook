// Optional task fields: an activity becomes a "tugas" when it has a due_date.
// completed_at (nullable) marks it done; overtime is derived (completed_at > due_date).
exports.up = function up(knex) {
  return knex.schema.alterTable('activities', (table) => {
    table.date('due_date').nullable();
    table.date('completed_at').nullable();
    table.index(['due_date']);
  });
};

exports.down = function down(knex) {
  return knex.schema.alterTable('activities', (table) => {
    table.dropColumn('due_date');
    table.dropColumn('completed_at');
  });
};
