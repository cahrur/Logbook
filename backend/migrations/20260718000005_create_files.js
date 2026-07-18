exports.up = function up(knex) {
  return knex.schema.createTable('files', (table) => {
    table.increments('id').primary();
    table
      .integer('module_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('modules')
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

    table.index(['module_id']);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists('files');
};
