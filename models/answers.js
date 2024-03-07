'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const departments = require('./departments');

var AnswersShema = Schema ({

    departments: {
        type: Schema.ObjectId,
        ref: 'departments'
    },
    category: String,
    issue: String,
    descIssue: String,
    createDate: {
        type: Date,
        default: Date.now,
    },
    info: [],
});

module.exports = mongoose.model('answers', AnswersShema)
