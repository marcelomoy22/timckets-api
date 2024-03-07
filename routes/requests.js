'use strict'

var express = require('express');
var RequestsController = require('../controllers/requests');

var api = express.Router();
var md_auth = require('../middelewares/authenticated')

var multipart = require('connect-multiparty') // funcion para subir un archivo
var md_upload = multipart({uploadDir: './uploads/requests'}) // funcion para subir un archivo

api.post('/chatGpt', RequestsController.chatGpt);
api.post('/all', RequestsController.all);
api.post('/allCallCenter', RequestsController.allCallCenter);
api.post('/allSolucionadosCallCenter', RequestsController.allSolucionadosCallCenter);
api.post('/allSolucionadosCallCenter2', RequestsController.allSolucionadosCallCenter2);
api.post('/allHistory', RequestsController.allHistory);
api.post('/allHistorySolucionado', RequestsController.allHistorySolucionado);
api.post('/allHistoryDepartments', RequestsController.allHistoryDepartments);
api.post('/allHistorySolucionadoDepartments', RequestsController.allHistorySolucionadoDepartments);
api.post('/allSolucionados', RequestsController.allSolucionados);
api.post('/allSolucionadosNum', RequestsController.allSolucionadosNum);
api.post('/prueba', RequestsController.prueba);
api.get('/enviarCorreoNuevo', RequestsController.enviarCorreoNuevo);
api.post('/addNote', RequestsController.addNote);
api.post('/getOneRequest', RequestsController.getOneRequest);
api.post('/getInCallCenter', RequestsController.getInCallCenter);
api.post('/asign', RequestsController.asign);
api.post('/asignCallCenter', RequestsController.asignCallCenter);
api.post('/reAsign', RequestsController.reAsign);
api.post('/eventos', RequestsController.eventos);
api.post('/statusExtra', RequestsController.statusExtra);
api.post('/pending', RequestsController.pending);
api.post('/issueValid', RequestsController.issueValid);
api.post('/pendingCallCenter', RequestsController.pendingCallCenter);
api.post('/editPending', RequestsController.editPending);
api.post('/editPendingCC', RequestsController.editPendingCC);
api.post('/reaperturar', RequestsController.reaperturar);
api.post('/solution', RequestsController.solution);
api.post('/solutionCallCenter', RequestsController.solutionCallCenter);
api.post('/solutionPreventivo', RequestsController.solutionPreventivo);
api.post('/encuesta', RequestsController.encuesta);
api.post('/getEncuesta', RequestsController.getEncuesta);
api.post('/getMessages', RequestsController.getMessages);
api.post('/getMessageAdmin', RequestsController.getMessageAdmin);
api.post('/getMessageDepto', RequestsController.getMessageDepto);
api.post('/getResponseDepto', RequestsController.getResponseDepto);
api.post('/newService', RequestsController.newService);
api.post('/editService', RequestsController.editService);
api.post('/searchService', RequestsController.searchService);
api.post('/searchSubCategoria', RequestsController.searchSubCategoria);
api.post('/areaBranches', RequestsController.areaBranches);
api.post('/getOneUser', RequestsController.getOneUser);
api.post('/uploadImage/:id', md_upload,RequestsController.uploadImage);
api.post('/uploadImageAfter/:id', md_upload,RequestsController.uploadImageAfter);
api.get('/getImage/:imageFile', [ md_upload],RequestsController.getImage);



module.exports = api;
