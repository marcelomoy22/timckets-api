'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const users = require('./users');

var LaborDayShema = Schema ({
    usersName: String,
    users:{
        type: Schema.ObjectId,
        ref: 'users'
    },
    laborCost: Number,
    laborHours: Number,
    venta: Number,
    numVenta: Number,
    plantillaTotal: Number,
    laborCostPorcent: Number,
    date: Date,
});

module.exports = mongoose.model('laborDay', LaborDayShema)
