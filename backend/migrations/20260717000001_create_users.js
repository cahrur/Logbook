exports.up = function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.enu('role', ['admin', 'member', 'viewer']).notNullable().defaultTo('member');
    table.timestamps(true, true);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists('users');
};
