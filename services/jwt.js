'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta'

exports.createToken = function(user){
    var payload ={
        sub: user.id,
        iat: user.iat= moment().unix(),
        exp: user.exp= moment().add(2,'hours').unix()
    }

    return jwt.encode(payload, secret);
}