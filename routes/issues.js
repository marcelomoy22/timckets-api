'use strict'

var express = require('express');
var IssuesController = require('../controllers/issues');

var api = express.Router();
var md_auth = require('../middelewares/authenticated')

var multipart = require('connect-multiparty') // funcion para subir un archivo

api.post('/issue', IssuesController.issue);
api.post('/allIssueNormal', IssuesController.allIssueNormal);
api.post('/getBySearch', IssuesController.getBySearch);
api.post('/sendsms', md_auth.ensureAuth, IssuesController.sendsms);


module.exports = api;
