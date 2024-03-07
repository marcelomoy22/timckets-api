'use strict'

var express = require('express');
var DepartmentsController = require('../controllers/departments');

var api = express.Router();
var md_auth = require('../middelewares/authenticated')

var multipart = require('connect-multiparty') // funcion para subir un archivo

api.post('/all', DepartmentsController.all);
api.get('/allAreas', DepartmentsController.allAreas);
api.get('/allProveedores', DepartmentsController.allProveedores);
api.post('/saveDepartment', DepartmentsController.saveDepartment);
api.post('/saveArea', DepartmentsController.saveArea);
api.post('/editDepartment', DepartmentsController.editDepartment);



module.exports = api;
