// Records who gave a direction/input/decision/change behind an activity —
// e.g. a decision from an atasan or client in a meeting. Both optional.
exports.up = function up(knex) {
  return knex.schema.alterTable('activities', (table) => {
    table.string('directive_type').nullable(); // masukan | keputusan | perubahan | arahan
    table.string('directive_from', 150).nullable(); // free text: bisa internal atau eksternal
  });
};

exports.down = function down(knex) {
  return knex.schema.alterTable('activities', (table) => {
    table.dropColumn('directive_type');
    table.dropColumn('directive_from');
  });
};
