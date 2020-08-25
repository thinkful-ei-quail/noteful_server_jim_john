const express = require('express');
const path = require('path');
const xss = require('xss');
const FolderService = require('./folder-service');

const folderRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = (folder) => ({
  id: folder.id,
  label: xss(folder.label),
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
    const { label } = req.body;
    const newFolder = { label };

    for (const [key, value] of Object.entries(newFolder)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    FolderService.insertFolder(knexInstance, newFolder)
      .then((folder) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  })
  .all((req, res, next) => {
    res.set('Allow', 'GET, POST').status(405).send();
  });

folderRouter
  .route('/:id')
  .all((req, res, next) => {
    FolderService.getById(knexInstance, folderId).then((folder) => {
      if (!folder) {
        return res
          .status(404)
          .json({ error: { message: `Folder doesn't exist` } });
      }
    });
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user));
  })
  .delete((req, res, next) => {
    FolderService.delete(req.app.get('db'), req.params.id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(() => {
    const { fullname, username, password, nickname } = req.body;
    const userToUpdate = { fullname, username, password, nickname };

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'fullname', 'username', 'password' or 'nickname'`,
        },
      });

    UsersService.updateUser(req.app.get('db'), req.params.user_id, userToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = folderRouter;
