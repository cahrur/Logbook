exports.up = function up(knex) {
  return knex.schema.createTable('activities', (table) => {
    table.increments('id').primary();
    table
      .integer('created_by')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .integer('module_id')
      .unsigned()
      .references('id')
      .inTable('modules')
      .onDelete('SET NULL');
    table.date('activity_date').notNullable();
    table.string('title').notNullable();
    table.text('description');
    table
      .enu('category', ['development', 'meeting', 'revisi', 'riset', 'blocked'])
      .notNullable()
      .defaultTo('development');
    table.integer('duration_minutes');
    table.timestamps(true, true);

    table.index(['activity_date']);
    table.index(['module_id']);
    table.index(['created_by']);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists('activities');
};
