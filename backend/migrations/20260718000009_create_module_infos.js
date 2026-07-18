exports.up = function up(knex) {
  return knex.schema.createTable('module_infos', (table) => {
    table.increments('id').primary();
    table
      .integer('module_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('modules')
      .onDelete('CASCADE');
    table
      .integer('created_by')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('title').notNullable();
    table.text('description');
    table.string('link', 2048).notNullable();
    table.timestamps(true, true);

    table.index(['module_id']);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists('module_infos');
};
