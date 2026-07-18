exports.up = function up(knex) {
  return knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('jti').notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['user_id']);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists('refresh_tokens');
};
