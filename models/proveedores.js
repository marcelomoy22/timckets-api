'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var proveedoresSchema = Schema ({
    name: String,
    });

proveedoresSchema.plugin(deepPopulate);

module.exports = mongoose.model('proveedores', proveedoresSchema)