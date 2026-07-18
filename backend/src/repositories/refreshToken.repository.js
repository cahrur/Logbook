const { knex } = require('../config/database');

const TABLE = 'refresh_tokens';

module.exports = {
  create({ userId, jti, expiresAt }) {
    return knex(TABLE).insert({
      user_id: userId,
      jti,
      expires_at: expiresAt,
    });
  },

  findByJti(jti) {
    return knex(TABLE).where({ jti }).first();
  },

  removeByJti(jti) {
    return knex(TABLE).where({ jti }).del();
  },

  removeAllForUser(userId) {
    return knex(TABLE).where({ user_id: userId }).del();
  },

  async countForUser(userId) {
    const row = await knex(TABLE).where({ user_id: userId }).count('* as c').first();
    return Number(row.c);
  },
};
