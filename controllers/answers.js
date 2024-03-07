'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt =require('bcrypt-nodejs');
var twt = require('../services/jwt');
var Answers = require('../models/answers');
const { remove } = require('../models/answers');
var mongoose = require('mongoose');

function getAnswers(req, res){
    Answers.find({},(err, answers)=>{
        if(err){
            res.status(500).send({message: 'Error en la petición'})
        } else{
            if(!answers){
                res.status(404).send({message: 'No existe'})
            }else{
                if(answers.length<1){
                    res.status(404).send({message: 'No existe'})
                }else{
                    var nuevoArray    = []
                    var arrayTemporal = []
                    for(var i=0; i<answers.length; i++){
                        arrayTemporal = nuevoArray.filter(resp => resp["name"] == answers[i]["category"])
                        if(arrayTemporal.length>0){
                            nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["issue"].push({id:answers[i]["_id"], category:answers[i]["category"], issue:answers[i]["issue"], descIssue:answers[i]["descIssue"], info:answers[i]["info"]})
                        }else{
                            nuevoArray.push({"name" : answers[i]["category"] , "issue" : [{id:answers[i]["_id"], category:answers[i]["category"], issue:answers[i]["issue"], descIssue:answers[i]["descIssue"], info:answers[i]["info"]}]})
                        }
                    }
                    res.status(200).send(nuevoArray)
                }
            }
        }
    }).sort({
        category: 1
    })
}

function uploadFile(req, res){
    var userId = req.params._id
    var file_name = 'No subido...'
    if(req.files){
        var file_path = req.files.image.path.split(/[\\/.]+/g)
        if(file_path[file_path.length-1] == 'png' || file_path[file_path.length-1] == 'jpg' || file_path[file_path.length-1] == 'jpeg' || file_path[file_path.length-1] == 'gif' || file_path[file_path.length-1] == 'pdf' || file_path[file_path.length-1] == 'xls' || file_path[file_path.length-1] == 'xlsx' || file_path[file_path.length-1] == 'csv' || file_path[file_path.length-1] == 'doc' || file_path[file_path.length-1] == 'docx' || file_path[file_path.length-1] == 'ppt' || file_path[file_path.length-1] == 'pptx' || file_path[file_path.length-1] == 'txt'){
            res.status(200).send({img: file_path[2] + "." + file_path[file_path.length-1], ext: file_path[file_path.length-1]})
        } else{
            res.status(200).send({message: 'Extencion del archivo no valido'})
        }
    } else{
        res.status(200).send({message: 'No has subido ninguna imagen'})
    }
}

function getImage (req,res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/answers/' + imageFile

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file))
        } else{
        res.status(200).send({message: 'No existe imagen'})
    }
    })
}

function addNewAnswer(req, res){
    var newArr = req.body.departments.split(',')
    req.body.category=newArr[1]
    req.body.departments=newArr[0]

    if(req.body.info){
        req.body.info.forEach((element, i) => {
            if(element.hipervinculo){
                req.body.info[i]= {hipervinculo: mongoose.Types.ObjectId(element.hipervinculo)}
            }
        });
    }

    var answer = new Answers(req.body);
    answer.save((err, answerNew)=>{
        if(err){
            res.status(500).send({message:"Error al guardar la pregunta"})
        } else{
            if(!answerNew){
                res.status(404).send({message:"No ha sido guardado"})
            } else{
                res.status(200).send({answer: answerNew})
            }
        }
    })



}


module.exports = {
    getAnswers,
    addNewAnswer,
    uploadFile,
    getImage,
}