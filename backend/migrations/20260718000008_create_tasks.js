exports.up = function up(knex) {
  return knex.schema.createTable('tasks', (table) => {
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
    table.text('detail');
    table.date('deadline').nullable();
    table
      .enu('status', ['todo', 'in_progress', 'review', 'done'])
      .notNullable()
      .defaultTo('todo');
    table.date('completed_at').nullable();
    table.integer('order_index').notNullable().defaultTo(0);
    table.timestamps(true, true);

    table.index(['module_id']);
    table.index(['assignee_id']);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists('tasks');
};
