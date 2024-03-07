'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const users = require('./users');
const issues = require('./issues');
const departments = require('./departments');

var RequestsShema = Schema ({
    codeRequest: String,
    consecutive: Number,
    service: String, 
    description: String,
    subCategory: String,
    anexos: String,
    urgency: String,
    reportBy: {
        type: Schema.ObjectId,
        ref: 'users'
    },
    issue: {
        type: Schema.ObjectId,
        ref: 'issues'
    },
    changeOriginIssue:{},
    reportBranch: String, // nombre de sucursal 
    status: String,
    manager: String,
    organization: String,
    analyst: {
        type: Schema.ObjectId,
        ref: 'users'
    },
    dateOfReport: {
        type: Date,
        default: Date.now,
    },
    title: String,
    dateLastUpdate: {
        type: Date,
        default: Date.now,
    },        
    dateAssignment: Date,        
    datePendieng: Date, 
    dateSolution: Date,
    dateAssignmentCallCenter: Date,        
    dateSolutionCallCenter: Date,
    datePendiengCallCenter: Date,        
    dateClosing: String,
    notes:[],
    pending: String,
    pendingCallCenter: String,
    solution: String,
    solutionCallCenter: String,
    solutionTime: [],
    tiempos:String,
    toDateNow:String,
    toencuesta:String,
    issueMore:{},
    department: {
        type: Schema.ObjectId,
        ref: 'departments'
    },
    imagenes:[],
    afterFiles:[],
    reportByAm: String,
    reaperturado:[],
    encuesta: String,
    encuestaComents: String,
    menuboards: {},
    cantBolsasComprobantes: {},
    numBolsaTipoCaja: {},
    dt: String,
    kds: {},
    medidas: {},
    email: String,
    numReport: String, 
    numOrden: String,
    producto: String,
    lote: String,
    cantidad: String,
    numSerie: String,
    marca: String,
    nombreTimMember: String,
    numNomina: String,
    pos:{},
    sucursalName: String,
    newdateOfReportUnformatted: Date,
    solutionBySucursal: String,
    solutionBy:{
        type: Schema.ObjectId,
        ref: 'users'   
    },
    statusCallCenter: String,
    motivoAsignadoCallCenter: String,
    vencidoCallCenter:String,
    solutionTimeHours: String,
    vencidoH:String,
    statusExtraDate: Date,
    statusExtra: String,
    statusExtraBy: {
        type: Schema.ObjectId,
        ref: 'users'
    },
    statusExtraMotivo: String,
    dateOfReport1:Date,
    version:String,
    pantalla:String,
    dispositivo:String,
    esperaRespuesta:Boolean,
});

module.exports = mongoose.model('requests', RequestsShema)
