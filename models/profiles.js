'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var profilesSchema = Schema ({
    name: String,
    permissions: [{
        title: String,
        class: String,
        submenu: [{
          title: String,
          class: String,
          href: String
        }]
      }]});

profilesSchema.plugin(deepPopulate);

module.exports = mongoose.model('profiles', profilesSchema)