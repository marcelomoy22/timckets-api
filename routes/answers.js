'use strict'

var express = require('express');
var AnswersController = require('../controllers/answers');

var api = express.Router();
var md_auth = require('../middelewares/authenticated')

var multipart = require('connect-multiparty') // funcion para subir un archivo
var md_upload = multipart({uploadDir: './uploads/answers'}) // funcion para subir un archivo

api.get('/getAnswers', AnswersController.getAnswers);
api.post('/addNewAnswer', AnswersController.addNewAnswer);
api.post('/uploadFile/:id', md_upload,AnswersController.uploadFile);
api.get('/getImage/:imageFile', md_upload,AnswersController.getImage);



module.exports = api;
