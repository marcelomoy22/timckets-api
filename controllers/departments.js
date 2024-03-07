'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt =require('bcrypt-nodejs');
var twt = require('../services/jwt');
var Departments = require('../models/departments');
var Users = require('../models/users');
var Areas = require('../models/areas');
var Proveedores = require('../models/proveedores');

const { remove } = require('../models/answers');
const { nextTick } = require('process');


function all(req, res){
    if(req.body.type=="superAdmin" || req.body.type=="callCenter"){
        Departments.find({},(err, requests)=>{
            res.status(200).send(requests)
        }).populate('responsable')
    }else{
        if(req.body.remitente&& req.body.remitente=="todos"){
            Departments.find({},(err, requests)=>{
                res.status(200).send(requests)
            }).populate('responsable')
        }else{
            Departments.find({_id: req.body.department}._id,(err, requests)=>{
                res.status(200).send(requests)
            }).populate('responsable')
        }
    }



}

function allAreas(req, res){
    Areas.find({},(err, requests)=>{


        var nuevo = []
        requests.forEach((element, index) =>{
            
            Users.find({area: element._id},(err, requests1)=>{
                
                nuevo.push({"area": requests[index], requests1})

                if(requests.length == nuevo.length){
                    res.status(200).send(nuevo)

                }

            }).sort(
                "name"
            ) 
        })
    }).populate('responsable').sort(
        "name") 
}

function allProveedores(req, res){
    Proveedores.find({},(err, requests)=>{

        res.status(200).send(requests)
    })

}
function saveDepartment(req, res){
    
    if(req.body.responsable == ''){
        req.body.responsable = null
    }
var departments = new Departments(req.body);
departments.save((err, userStored)=>{
    if(err){
        res.status(500).send({message: 'Error al guardar el departamento'})
    } else{
        if(!userStored){
            res.status(404).send({message: 'No se pudo registrar el departamento'})
        } else{
            res.status(200).send({users: userStored})
        }
    }
});

}

function editDepartment(req, res){
Departments.findByIdAndUpdate(req.body.id,{active: req.body.active, name: req.body.names, shortName:req.body.shortName, responsable: req.body.responsable},(err, requests)=>{
    res.status(200).send(requests)
})
}

function saveArea(req, res){

var areas = new Areas(req.body);
areas.save((err, userStored)=>{
    if(err){
        res.status(500).send({message: 'Error al guardar el area'})
    } else{
        if(!userStored){
            res.status(404).send({message: 'No se pudo registrar el area'})
        } else{
            res.status(200).send({users: userStored})
        }
    }
});
}

module.exports = {
    all,
    allAreas,
    allProveedores,
    saveDepartment,
    saveArea,
    editDepartment,
}