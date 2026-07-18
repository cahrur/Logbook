// Module schedule: when it started and the target completion date.
// Overtime is derived on the client (target passed and not done).
exports.up = function up(knex) {
  return knex.schema.alterTable('modules', (table) => {
    table.date('start_date').nullable();
    table.date('target_date').nullable();
  });
};

exports.down = function down(knex) {
  return knex.schema.alterTable('modules', (table) => {
    table.dropColumn('start_date');
    table.dropColumn('target_date');
  });
};
