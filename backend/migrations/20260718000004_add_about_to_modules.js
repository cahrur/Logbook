// Long-form markdown documentation for a module ("About").
exports.up = function up(knex) {
  return knex.schema.alterTable('modules', (table) => {
    table.text('about', 'longtext').nullable();
  });
};

exports.down = function down(knex) {
  return knex.schema.alterTable('modules', (table) => {
    table.dropColumn('about');
  });
};
