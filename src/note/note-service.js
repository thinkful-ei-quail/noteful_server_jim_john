module.exports = {
  getAll(knex) {
    return knex.select('*').from('note');
  },

  insert(knex, newNote) {
    return knex
      .insert(newNote)
      .into('note')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex.from('note').select('*').where('id', id).first();
  },

  delete(knex, id) {
    return knex('note').where({ id }).delete();
  },

  update(knex, id, newNoteFields) {
    return knex('note').where({ id }).update(newNoteFields);
  },
};
