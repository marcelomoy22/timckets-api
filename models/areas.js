'use strict'

var mongoose = require('mongoose');
const users = require('./users');
var Schema = mongoose.Schema;

var AreasShema = Schema ({
    name: Number,
    responsable: {
        type: Schema.ObjectId,
        ref: 'users'
    },
    createDate: {
        type: Date,
        default: Date.now,
    },
    active: {
        type: Boolean,
        default: true
      }
    });

module.exports = mongoose.model('areas', AreasShema)