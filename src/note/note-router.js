/* eslint-disable quotes */
const express = require('express');
const path = require('path');
const xss = require('xss');
const NoteService = require('./note-service');

const noteRouter = express.Router();
//const jsonParser = express.json();

const serializeNote = (note) => ({
  id: note.id,
  name: xss(note.name),
  content: xss(note.content),
  modified: note.modified,
  folderId: note.folderId,
});

noteRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    NoteService.getAll(knexInstance)
      .then((notes) => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { name, content, folderId } = req.body;
    const newNote = { name, content, folderId };

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    NoteService.insert(knexInstance, newNote)
      .then((note) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

noteRouter
  .route('/:id')
  .all((req, res, next) => {
    NoteService.getById(req.app.get('db'), req.params.id).then((note) => {
      if (!note) {
        return res
          .status(404)
          .json({ error: { message: `Note doesn't exist` } });
      }
      res.note = note;
      next();
    });
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    NoteService.delete(req.app.get('db'), req.params.id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const { name, content } = req.body;
    const noteToUpdate = { name, content };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: "Request body must contain either 'name', or 'content'",
        },
      });

    NoteService.update(req.app.get('db'), req.params.id, noteToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = noteRouter;
