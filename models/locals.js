'use strict'

var mongoose = require('mongoose');
const users = require('./users');
var Schema = mongoose.Schema;

var LocalsShema = Schema ({
    name: String,
    address: String,
    zone: String,
    phone: Number,
    image: String,
    responsable: {
        type: Schema.ObjectId,
        ref: 'users'
    },
    createDate: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('locals', LocalsShema)
