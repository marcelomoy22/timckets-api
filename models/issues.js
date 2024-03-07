'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const departments = require('./departments');
const users = require('./users');


var IssuesShema = Schema ({

    category : String, 
    service : String, 
    descService : String, 
    subcategory : String, 
    descSubcategory : String, 
    sla : Number,
    slaCallCenter: Number,
    active: Boolean,
    critico: Boolean,
    validado: Boolean,
    chatbot: Boolean,
    descSla: String,
    format: String,
    departments: {
        type: Schema.ObjectId,
        ref: 'departments'
    },
    emailToSendCopy: [{
        type: Schema.ObjectId,
        ref: 'users'
    }],
    emailToSendAnalist: [{
        type: Schema.ObjectId,
        ref: 'users'
    }],
    createDate: {
        type: Date,
        default: Date.now,
    },
    campo:{},
    zonesToAnalyst: {
        general: Boolean,
        porEstado: Boolean
    },
    zonesNL: {
        zonesNLAnalyst:[{
            type: Schema.ObjectId,
            ref: 'users'
        }],
        zonesNLCopiados:[{
            type: Schema.ObjectId,
            ref: 'users'
        }]
    },
    zonesCoahila: {
        zonesCoahilaAnalyst:[{
            type: Schema.ObjectId,
            ref: 'users'
        }],
        zonesCoahilaCopiados:[{
            type: Schema.ObjectId,
            ref: 'users'
        }]
    },
    zonesQueretaro: {
        zonesQueretaroAnalyst:[{
            type: Schema.ObjectId,
            ref: 'users'
        }],
        zonesQueretaroCopiados:[{
            type: Schema.ObjectId,
            ref: 'users'
        }]
    },
    zonesMexico: {
        zonesMexicoAnalyst:[{
            type: Schema.ObjectId,
            ref: 'users'
        }],
        zonesMexicoCopiados:[{
            type: Schema.ObjectId,
            ref: 'users'
        }]
    },
});

module.exports = mongoose.model('issues', IssuesShema)
