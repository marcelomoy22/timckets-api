'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const users = require('./users');

var LaborXHoursShema = Schema ({
    usersName: String,
    users:{
        type: Schema.ObjectId,
        ref: 'users'
    },
    plantillaXHour: Number,
    start: Date,
    end: Date,
    startNormalFormat: Date,
    endNormalFormat: Date,
    net_salesXHour: Number,
    guest_countXHour: Number,
});

module.exports = mongoose.model('laborXHours', LaborXHoursShema)
