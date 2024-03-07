'use strict'

var express = require('express');
var UsersController = require('../controllers/users');

var api = express.Router();
var md_auth = require('../middelewares/authenticated')

var multipart = require('connect-multiparty') // funcion para subir un archivo
var md_upload = multipart({uploadDir: './uploads/users'}) // funcion para subir un archivo

api.get('/extra', UsersController.extra);
api.get('/laborSetInterval', UsersController.laborSetInterval);
api.get('/labor', UsersController.labor);
api.get('/laborXHora', UsersController.laborXHora);
api.get('/laborDay', UsersController.laborDay);
api.get('/speedOfService', UsersController.speedOfService);
api.get('/tokenXenial', UsersController.tokenXenial);
api.get('/getAccessToken', UsersController.getAccessToken);
api.get('/orders', UsersController.orders);
api.get('/ordersDay', UsersController.ordersDay);
api.get('/autoClosed', UsersController.autoClosed);
api.get('/autoEscalamiento', UsersController.autoEscalamiento);
api.get('/getLocalsXLabor', UsersController.getLocalsXLabor);
api.get('/prueba', UsersController.prueba);
api.get('/usersAdmin', UsersController.usersAdmin);
api.get('/getLocals', UsersController.getLocals);
api.get('/allAreasOnly', UsersController.allAreasOnly);
api.get('/getImage/:image', UsersController.getImage);
api.get('/getImageLogo/:image', UsersController.getImageLogo);
api.post('/editLocal',  UsersController.editLocal);
api.post('/oneUser',  UsersController.oneUser);
api.get('/getMoment',  UsersController.getMoment);
api.get('/getTime',  UsersController.getTime);
api.post('/saveUser', md_auth.ensureAuth, UsersController.saveUser);
api.post('/changePassword', UsersController.changePassword);
api.post('/loginUser', UsersController.loginUser);
api.post('/passwordToResume', UsersController.passwordToResume);
api.post('/updateUser/:id', md_auth.ensureAuth, UsersController.updateUser);
api.post('/uploadImage/:id', md_upload, UsersController.uploadImage);
api.post('/editVentaRequerida', UsersController.editVentaRequerida);
api.post('/getFilter', UsersController.getFilter);
api.get('/getSpeedOfService', UsersController.getSpeedOfService);
api.get('/autoCompleteIssues', UsersController.autoCompleteIssues);
api.get('/autoCodeRequestDuplicate', UsersController.autoCodeRequestDuplicate);

module.exports = api;
