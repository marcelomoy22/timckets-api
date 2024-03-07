'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Cargar rutas
var users = require('./routes/users');
var locals = require('./routes/locals');
var answers = require('./routes/answers');
var issues = require('./routes/issues');
var requests = require('./routes/requests');
var departments = require('./routes/departments');


app.use (bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Configurar cabeceras http
app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY ,Origin, X-Requested-With, Content-type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// rutas base
app.use('/api/users', users);
app.use('/api/locals', locals);
app.use('/api/answers', answers);
app.use('/api/issues', issues);
app.use('/api/requests', requests);
app.use('/api/departments', departments);


module.exports = app;
