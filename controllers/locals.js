'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt =require('bcrypt-nodejs');
var twt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination'); // son los datos que quieres que te muestren por pagina
var Locals = require('../models/locals');

function getLocals(req, res){
    if(req.params.page){
        var page = req.params.page
    } else{
        var page = 1
    }

    var itemsPerPage = 3

    Locals.find().sort('name').paginate(page, itemsPerPage, function(err, locals, total){
        if(err){
            res.status(500).send({message:"Error en la peticion"})
        } else{
            if(!locals){
                res.status(404).send({message:"No hay artistas"})
            } else{
                return res.status(200).send({pages: total, locals: locals})
            }
        }
    })

}

function getLocal(req, res){
    Locals.findById(req.params.id,(err,local)=>{
        if(err){
            res.status(500).send({message:"Error en la peticion"})
        } else{
            if(!local){
                res.status(404).send({message:"El local no existe"})
            } else{
                res.status(200).send({local})
            }
        }
    })
}

function saveLocal(req, res){
    var local = new Locals(req.body);
    local.save((err, localStored)=>{
        if(err){
            res.status(500).send({message:"Error al guardar el local"})
        } else{
            if(!localStored){
                res.status(404).send({message:"No ha sido guardado"})
            } else{
                res.status(200).send({local: localStored})

            }
        }
    })

}

function updateLocal(req, res){
    Locals.findByIdAndUpdate(req.params.id, req.body, (err, localUpdated)=>{
        if(err){
            res.status(500).send({message: 'Error al actualizar'})
        } else{
            if(!localUpdated){
                res.status(404).send({message: 'No se pudo actualizar'})
            } else{
                res.status(200).send({localUpdated})
            }
        }
    })
}


// function getAccessToken(req, res){

    // ---------------------------------------------------------------------------


    // var headers2 = {
    //     headers:{
    //     'Content-Type': 'application/json',
    //     'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjlHbW55RlBraGMzaE91UjIybXZTdmduTG83WSIsImtpZCI6IjlHbW55RlBraGMzaE91UjIybXZTdmduTG83WSJ9.eyJhdWQiOiJhcGk6Ly80MTAyOGM3Ni1kOWE3LTRmMzAtYTk2YS1kMjYxODJlNjczZDkiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mYTI2ODhlMy0zYTcxLTRjODktODY0NC01NDZmMTQ5NTcwMGMvIiwiaWF0IjoxNjk3NTc4MDYwLCJuYmYiOjE2OTc1NzgwNjAsImV4cCI6MTY5NzU4MTk2MCwiYWlvIjoiRTJGZ1lEQThaZlUxOFBpVFQ0ZkxGeCszWURaZUJRQT0iLCJhcHBpZCI6IjZiZWE3MDNkLWJiYzgtNGIwOC04Y2JlLTRlMGUyMTA5OGE5MiIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2ZhMjY4OGUzLTNhNzEtNGM4OS04NjQ0LTU0NmYxNDk1NzAwYy8iLCJvaWQiOiIzYjM0OTEwZS0yNzMyLTQ5MmYtOWQyNC0yNjAwNmRiNDNhNDciLCJyaCI6IjAuQVZBQTQ0Z20tbkU2aVV5R1JGUnZGSlZ3REhhTUFrR24yVEJQcVdyU1lZTG1jOWxfQUFBLiIsInJvbGVzIjpbImFwaS5yZWFkd3JpdGUiXSwic3ViIjoiM2IzNDkxMGUtMjczMi00OTJmLTlkMjQtMjYwMDZkYjQzYTQ3IiwidGlkIjoiZmEyNjg4ZTMtM2E3MS00Yzg5LTg2NDQtNTQ2ZjE0OTU3MDBjIiwidXRpIjoicGNWdmt3UEtPME9YR2xTbF8tUWxBUSIsInZlciI6IjEuMCJ",
    //     }
    // }

    // axios.get('https://thbackend.loymarkservices.com/api/userapp', headers2).then(function (req) {
    //     console.log(req)

    // }).catch(err => {
    //     console.log(err)
    // })


    // var params = {
    //     "userAppID": ,
    //     "firstName": "",
    //     "lastName": "",
    //     "username": "",
    //     "password": "",
    //     "status": ""
    //   }


    // axios.post('https://thbackend.loymarkservices.com/api/userapp/create', params, headers2).then(req =>{

    // console.log(req)

    // }).catch(err => {
    //     console.log(err)
    // })




// }

module.exports = {
    // getAccessToken,
    getLocal,
    saveLocal,
    getLocals,
    updateLocal
    
}