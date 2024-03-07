'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const departments = require('./departments');
const areas = require('./areas');
const users = require('./users');
const speedOfService = require('./speedOfService');
const proveedores = require('./proveedores');


var UsersShema = Schema ({
    fname: String,
    lname: String,
    name: String,
    userLog: String,
    type: String,
    areaManager: String,
    phone: Number,
    email: String,
    createDate: {
        type: Date,
        default: Date.now,
    },
    // profile: {
    //     type: Schema.ObjectId,
    //     ref: 'profiles'
    // },
    password: String,
    password2: String,
    image: String,
    department: {
        type: Schema.ObjectId,
        ref: 'departments'
    },
    state: String,
    municipality: String,
    business: {
        type: Schema.ObjectId,
        ref: 'proveedores'
    },
    street: String,
    numExt: String,
    numInt: String,
    suburb: String,
    area:  {
        type: Schema.ObjectId,
        ref: 'areas'
    },
    responsable:{
        type: Schema.ObjectId,
        ref: 'users'
    },
    ventaRequerida:{
        vmensual: String,
        vdia: String,
        laborMensual: String,
        laborDia: String,
        laborDiaPorcent: String,
        changeBy: {
            type: Schema.ObjectId,
            ref: 'users'
        },
        period:Number,
    },
    rbiNumber:String,
    xenialId:String,
    upload: String,
    postalCode: String,
    xenialData:{
        saleTotal:{},
        saleXHour:{},
        labor:{
            plantillaTotal:String,
            laborCost: Number,
            laborHours: String,
            labor:Number,
        },
        dateUpload: Date
    },
    speedOfService: {
        tiempoDia: String,
        ticketsDia: String,
        segundosTotales: Number,
        tiempoHour: String,
        segundosTotalesHour: Number,
        ticketsHour: String,
        dateUpload: Date,
        ordenes: Array,
    },
    newSpeedOfService: {
        type: Schema.ObjectId,
        ref: 'speedOfService'
    },
    xenialToken: String,
});

module.exports = mongoose.model('users', UsersShema)