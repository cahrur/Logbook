exports.up = function up(knex) {
  return knex.schema.createTable('modules', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table
      .enu('status', ['planned', 'in_progress', 'done', 'on_hold'])
      .notNullable()
      .defaultTo('planned');
    table.integer('progress').notNullable().defaultTo(0);
    table
      .integer('pic_user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.integer('order_index').notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists('modules');
};
