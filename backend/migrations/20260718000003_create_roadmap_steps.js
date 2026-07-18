exports.up = function up(knex) {
  return knex.schema.createTable('roadmap_steps', (table) => {
    table.increments('id').primary();
    table
      .integer('module_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('modules')
      .onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table
      .enu('status', ['planned', 'in_progress', 'done'])
      .notNullable()
      .defaultTo('planned');
    table.date('target_date').nullable();
    table.integer('order_index').notNullable().defaultTo(0);
    table.timestamps(true, true);

    table.index(['module_id']);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists('roadmap_steps');
};
