'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta'

exports.ensureAuth = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(403).send({message: 'La peticion no tiene autenticación'})
    }
    var token = req.headers.authorization.replace(/['"]+/g,'')

    try{
        var payload = jwt.decode(token, secret)

        if(payload.exp <= moment().unix()){
            return res.status(401).send({message: 'token-expirado'})
        }
    }catch(ex){
        return res.status(403).send({message: 'token-no-valido, vuelva a iniciar seción'})
    }
    req.user = payload

    next()
}