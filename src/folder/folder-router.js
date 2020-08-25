const express = require('express');
const path = require('path');
const xss = require('xss');
const FolderService = require('./folder-service');

const folderRouter = express.Router();
//const jsonParser = express.json();

const serializeFolder = (folder) => ({
  id: folder.id,
  name: xss(folder.name),
});

folderRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    FolderService.getAll(knexInstance)
      .then((folders) => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { name } = req.body;
    const newFolder = { name };

    for (const [key, value] of Object.entries(newFolder)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    FolderService.insert(knexInstance, newFolder)
      .then((folder) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

folderRouter
  .route('/:id')
  .all((req, res, next) => {
    FolderService.getById(req.app.get('db'), req.params.id).then((folder) => {
      if (!folder) {
        return res
          .status(404)
          .json({ error: { message: `Folder doesn't exist` } });
      }
      res.folder = folder;
      next();
    });
  })
  .get((req, res, _next) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    FolderService.delete(req.app.get('db'), req.params.id)
      .then((_numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const { name } = req.body;
    const folderToUpdate = { name };

    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'name'`,
        },
      });

    FolderService.updateUser(req.app.get('db'), req.params.id, folderToUpdate)
      .then((_numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = folderRouter;
