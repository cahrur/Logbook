exports.up = function up(knex) {
  return knex.schema.createTable('issue_images', (table) => {
    table.increments('id').primary();
    table
      .integer('issue_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('issues')
      .onDelete('CASCADE');
    table
      .integer('uploaded_by')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('original_name').notNullable();
    table.string('stored_name').notNullable();
    table.string('mime_type').notNullable();
    table.integer('size_bytes').notNullable();
    table.timestamps(true, true);

    table.index(['issue_id']);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists('issue_images');
};
