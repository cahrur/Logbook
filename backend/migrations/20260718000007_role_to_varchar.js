// Widen users.role from a fixed ENUM/CHECK to VARCHAR so new roles
// (superadmin) can be added. Allowed values are enforced at the validation
// layer. Handled per-dialect because each stores the enum differently.
exports.up = async function up(knex) {
  const client = knex.client.config.client;

  if (client.includes('mysql')) {
    await knex.raw("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'member'");
    return;
  }

  if (client === 'pg' || client === 'postgresql') {
    await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await knex.raw('ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20)');
    await knex.raw("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'member'");
    return;
  }

  // SQLite: rebuild the column to drop its inline CHECK constraint.
  await knex.schema.alterTable('users', (t) => {
    t.string('role_new', 20).notNullable().defaultTo('member');
  });
  await knex('users').update({ role_new: knex.ref('role') });
  await knex.schema.alterTable('users', (t) => t.dropColumn('role'));
  await knex.schema.alterTable('users', (t) => t.renameColumn('role_new', 'role'));
};

exports.down = async function down() {
  // Irreversible narrowing is unsafe; leave role as VARCHAR.
};
