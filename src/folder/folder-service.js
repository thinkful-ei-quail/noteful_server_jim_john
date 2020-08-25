module.exports = {
  getAll(knex) {
    return knex.select('*').from('folder');
  },

  insert(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into('folder')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex.from('folder').select('*').where('id', id).first();
  },

  delete(knex, id) {
    return knex('folder').where({ id }).delete();
  },

  update(knex, id, newFolderFields) {
    return knex('folder').where({ id }).update(newFolderFields);
  },
};
