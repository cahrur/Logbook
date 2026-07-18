exports.up = function up(knex) {
  return knex.schema.createTable('issues', (table) => {
    table.increments('id').primary();
    table
      .integer('module_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('modules')
      .onDelete('CASCADE');
    table
      .integer('assignee_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .integer('created_by')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('title').notNullable();
    table.text('description');
    table
      .enu('priority', ['low', 'medium', 'high', 'critical'])
      .notNullable()
      .defaultTo('medium');
    table
      .enu('status', ['open', 'in_progress', 'resolved', 'closed'])
      .notNullable()
      .defaultTo('open');
    table.date('deadline').nullable();
    table.timestamps(true, true);

    table.index(['module_id']);
    table.index(['assignee_id']);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists('issues');
};
