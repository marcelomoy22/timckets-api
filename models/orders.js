'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const users = require('./users');


var OrdersShema = Schema ({
    usersName: String,
    users:{
        type: Schema.ObjectId,
        ref: 'users'
    },
    updated_at: Date,
    created: Date,
    closed: Date,
    kitchen_sent: Date,
    kitchen_bump: Date,
    first_saved: Date,
    first_item_added: Date,
    order_number: String,
    destination_name: String,
    order_id: String,
    durationSeconds: Number,
    orderTakingTime: Number,
    net_sales: Number,
});

module.exports = mongoose.model('orders', OrdersShema)
