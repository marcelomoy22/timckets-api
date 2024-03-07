'use strict'

var express = require('express');
var localsController = require('../controllers/locals');

var api = express.Router();
var md_auth = require('../middelewares/authenticated')

var multipart = require('connect-multiparty')
// var md_upload = multipart({uploadDir: './uploads/users'})

api.get('/getLocal/:id', localsController.getLocal);
api.get('/getLocals/:page?', localsController.getLocals);
api.post('/saveLocal', localsController.saveLocal);
api.post('/updateLocal/:id', localsController.updateLocal);


// api.post('/updateUser/:id', localsController.updateUser);
// api.post('/uploadImage/:id', md_upload, localsController.uploadImage);



module.exports = api;
