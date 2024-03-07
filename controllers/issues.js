'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt =require('bcrypt-nodejs');
var twt = require('../services/jwt');
var Issues = require('../models/issues');
var mongoose = require('mongoose');
const { remove } = require('../models/answers');


function issue(req, res){
    if((req.body.type=="superAdmin" || req.body.type=="admin") && req.body.department._id=="62f1a82422e803510bacee97"){
        var querty={
            active:true
        }
    }else{
        var querty={
            active:true,
            _id: {$ne: mongoose.Types.ObjectId('646240cefd45ee0be22c3997')},
        }
    }

    Issues.find(querty,(err, issues)=>{
        if(err){
            res.status(500).send({message: 'Error en la petición'})
        } else{
            if(!issues){
                res.status(404).send({message: 'No existe'})
            }else{
                if(issues.length<1){
                    res.status(404).send({message: 'No existe'})
                }else{
                    var nuevoArray    = []
                    var arrayTemporal = []
                    for(var i=0; i<issues.length; i++){
                        arrayTemporal = nuevoArray.filter(resp => resp["name"] == issues[i]["category"])
                        if(arrayTemporal.length>0){
                            nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["service"].push({id:issues[i]["_id"], category:issues[i]["category"], departments:issues[i]["departments"], subcategory:issues[i]["subcategory"], issue:issues[i]["service"], descService:issues[i]["descService"], descSubcategory:issues[i]["descSubcategory"], sla:issues[i]["sla"], format:issues[i]["format"], descSla:issues[i]["descSla"], campo:issues[i]["campo"], chatbot:issues[i]["chatbot"]})
                        }else{
                            nuevoArray.push({"name" : issues[i]["category"] , "service" : [{id:issues[i]["_id"], category:issues[i]["category"], departments:issues[i]["departments"],  subcategory:issues[i]["subcategory"], descService:issues[i]["descService"], issue:issues[i]["service"], descSubcategory:issues[i]["descSubcategory"], sla:issues[i]["sla"], format:issues[i]["format"], descSla:issues[i]["descSla"], campo:issues[i]["campo"], chatbot:issues[i]["chatbot"]}], "service2" : []})
                        }
                    }

                    for(var i=0; i<nuevoArray.length; i++){
                        var nuevoArray2 = []
                        var arrayTemporal2 = []
                        for(var y=0; y<nuevoArray[i].service.length; y++){

                            arrayTemporal2 = nuevoArray2.filter(resp => resp["subName"] == nuevoArray[i].service[y]["issue"])
                            if(arrayTemporal2.length>0){
                                nuevoArray2[nuevoArray2.indexOf(arrayTemporal2[0])]["subcategory"].push({id:nuevoArray[i].service[y]["id"], subcategory: nuevoArray[i].service[y]["subcategory"], descSubcategory:nuevoArray[i].service[y]["descSubcategory"], category:nuevoArray[i].service[y]["category"], departments:nuevoArray[i].service[y]["departments"], servicio:nuevoArray[i].service[y]["issue"], sla:nuevoArray[i].service[y]["sla"], format:nuevoArray[i].service[y]["format"], descSla:nuevoArray[i].service[y]["descSla"], campo:nuevoArray[i].service[y]["campo"], chatbot:nuevoArray[i].service[y]["chatbot"]})
                            }else{
                                nuevoArray2.push({"subName" : nuevoArray[i].service[y]["issue"], "descService" : nuevoArray[i].service[y]["descService"], "subcategory" :[{id: nuevoArray[i].service[y]["id"], subcategory: nuevoArray[i].service[y]["subcategory"], descSubcategory:nuevoArray[i].service[y]["descSubcategory"], category:nuevoArray[i].service[y]["category"], departments:nuevoArray[i].service[y]["departments"], servicio:nuevoArray[i].service[y]["issue"], sla:nuevoArray[i].service[y]["sla"], format:nuevoArray[i].service[y]["format"], descSla:nuevoArray[i].service[y]["descSla"], campo:nuevoArray[i].service[y]["campo"], chatbot:nuevoArray[i].service[y]["chatbot"] }]})
                            }
                        }
                        nuevoArray[i].service2.push(nuevoArray2)
                    }

                    res.status(200).send(nuevoArray)
                }
            }
        }
    }).populate('departments').sort({
        category: 1,
        service: 1
    }) 
}

function allIssueNormal(req,res){
    if(req.body.type=="superAdmin" || req.body.type=="callCenter"){
        Issues.find({},(err, issues)=>{
        if(err){
            res.status(500).send({message: 'Error en la petición'})
        } else{
            res.status(200).send(issues)
        }
    }).populate('departments').sort({
        category: 1,
        service: 1
    }) 
} else{
    Issues.find({"departments": req.body.department},(err, issues)=>{
        if(err){
            res.status(500).send({message: 'Error en la petición'})
        } else{
            res.status(200).send(issues)
        }
    }).populate('departments').sort({
        category: 1,
        service: 1
    }) 
}
}


function getBySearch(req,res){
    if((req.body.user.type=="superAdmin" || req.body.user.type=="admin") && req.body.user.department._id=="62f1a82422e803510bacee97"){
        var querty={ 
            $or: [
                {
                    active:true, subcategory: {$regex: req.body.letra, $options:'i'}
                },
                {
                    active:true, descSubcategory: {$regex: req.body.letra, $options:'i'}
                },
                {
                    active:true, service: {$regex: req.body.letra, $options:'i'}
                },
                {
                    active:true, descService: {$regex: req.body.letra, $options:'i'}
                }
              ]
        }
    }else{
        var querty={
            $or: [
                {
                    subcategory: {$regex: req.body.letra, $options:'i'},
                    active:true,
                    _id: {$ne: mongoose.Types.ObjectId('646240cefd45ee0be22c3997')}
                },
                {
                    descSubcategory: {$regex: req.body.letra, $options:'i'},
                    active:true,
                    _id: {$ne: mongoose.Types.ObjectId('646240cefd45ee0be22c3997')}
                },
                {
                    service: {$regex: req.body.letra, $options:'i'},
                    active:true,
                    _id: {$ne: mongoose.Types.ObjectId('646240cefd45ee0be22c3997')}
                },
                {
                    descService: {$regex: req.body.letra, $options:'i'},
                    active:true,
                    _id: {$ne: mongoose.Types.ObjectId('646240cefd45ee0be22c3997')}
                }
              ]
        }
    }

    Issues.find(querty,(err, issues)=>{
        if(err){
            res.status(500).send({message: 'Error en la petición'})
        } else{
            var nuevoArray    = []
            var arrayTemporal = []
            for(var i=0; i<issues.length; i++){
                arrayTemporal = nuevoArray.filter(resp => resp["name"] == issues[i]["category"])
                if(arrayTemporal.length>0){
                    nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["service"].push({id:issues[i]["_id"], category:issues[i]["category"], departments:issues[i]["departments"], subcategory:issues[i]["subcategory"], issue:issues[i]["service"], descService:issues[i]["descService"], descSubcategory:issues[i]["descSubcategory"], sla:issues[i]["sla"], format:issues[i]["format"], descSla:issues[i]["descSla"], campo:issues[i]["campo"], chatbot:issues[i]["chatbot"]})
                }else{
                    nuevoArray.push({"name" : issues[i]["category"] , "service" : [{id:issues[i]["_id"], category:issues[i]["category"], departments:issues[i]["departments"],  subcategory:issues[i]["subcategory"], descService:issues[i]["descService"], issue:issues[i]["service"], descSubcategory:issues[i]["descSubcategory"], sla:issues[i]["sla"], format:issues[i]["format"], descSla:issues[i]["descSla"], campo:issues[i]["campo"], chatbot:issues[i]["chatbot"]}], "service2" : []})
                }
            }
            for(var i=0; i<nuevoArray.length; i++){
                var nuevoArray2 = []
                var arrayTemporal2 = []
                for(var y=0; y<nuevoArray[i].service.length; y++){

                    arrayTemporal2 = nuevoArray2.filter(resp => resp["subName"] == nuevoArray[i].service[y]["issue"])
                    if(arrayTemporal2.length>0){
                        nuevoArray2[nuevoArray2.indexOf(arrayTemporal2[0])]["subcategory"].push({id:nuevoArray[i].service[y]["id"], subcategory: nuevoArray[i].service[y]["subcategory"], descSubcategory:nuevoArray[i].service[y]["descSubcategory"], category:nuevoArray[i].service[y]["category"], departments:nuevoArray[i].service[y]["departments"], servicio:nuevoArray[i].service[y]["issue"], sla:nuevoArray[i].service[y]["sla"], format:nuevoArray[i].service[y]["format"], descSla:nuevoArray[i].service[y]["descSla"], campo:nuevoArray[i].service[y]["campo"], chatbot:nuevoArray[i].service[y]["chatbot"]})
                    }else{
                        nuevoArray2.push({"subName" : nuevoArray[i].service[y]["issue"], "descService" : nuevoArray[i].service[y]["descService"], "subcategory" :[{id: nuevoArray[i].service[y]["id"], subcategory: nuevoArray[i].service[y]["subcategory"], descSubcategory:nuevoArray[i].service[y]["descSubcategory"], category:nuevoArray[i].service[y]["category"], departments:nuevoArray[i].service[y]["departments"], servicio:nuevoArray[i].service[y]["issue"], sla:nuevoArray[i].service[y]["sla"], format:nuevoArray[i].service[y]["format"], descSla:nuevoArray[i].service[y]["descSla"], campo:nuevoArray[i].service[y]["campo"], chatbot:nuevoArray[i].service[y]["chatbot"] }]})
                    }
                }
                nuevoArray[i].service2.push(nuevoArray2)
            }
            res.status(200).send(nuevoArray)
        }
    }).populate('departments').sort({
        category: 1,
        service: 1
    }) 

}

function sendsms(req,res){
    res.status(200).send({message: 'Aqui mandar mensajitos'})
}



module.exports = {
    issue,
    allIssueNormal,
    sendsms,
    getBySearch,
}