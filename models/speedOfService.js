'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const users = require('./users');


var SpeedOfServiceShema = Schema ({
    name: String,
    users:{
        type: Schema.ObjectId,
        ref: 'users'
    },
    speedOfService: {
        tiempoDia: String,
        ticketsDia: String,
        segundosTotales: Number,
        tiempoHour: String,
        segundosTotalesHour: Number,
        ticketsHour: String,
        dateUpload: Date,
        orders:[],
    }
});

module.exports = mongoose.model('speedOfService', SpeedOfServiceShema)
