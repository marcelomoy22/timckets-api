'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt =require('bcrypt-nodejs');
var twt = require('../services/jwt');
var Requests = require('../models/requests');
var Users = require('../models/users');
var Issues = require('../models/issues');
var Departments = require('../models/departments');
var Areas = require('../models/areas');
const { remove } = require('../models/answers');
const moment = require('moment-timezone')
var mongoose = require('mongoose');
var async = require('async');
var axios = require('axios');

var nodemailer = require('nodemailer');
const { MarketplaceCatalog } = require('aws-sdk');
const { Console } = require('console');

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // 587 es para enviar correos, y 465 es para recibir correos
    secure: true, // use SSL 
    auth: {
      user: '',
      pass: ''
    },
    tls: {
      rejectUnauthorized: false
    }
})

function all(req, res){
        if(req.body.type == "local"){
            Requests.find(
            {
                $and: [
                    { reportBy: req.body._id },
                    { status: { $nin: ["Solucionado", "SolucionadoPreventivo", "AutoSolucionado"] } },
                    { statusCallCenter: { $nin: ["SolucionadoPreventivoCallCenter", "SolucionadoCallCenter", "AutoSolucionado"] } }
                ]
            }
                ,(err, requests)=>{
                res.status(200).send(requests)
            }).populate('issue').populate('analyst').populate({path: 'reportBy', populate:{path: 'area'}})
            
        }else if(req.body.type == "areaManager"){
            const reqs = req.body
            async.waterfall([
                function step1(next) {
                    Areas.find({responsable: mongoose.Types.ObjectId(reqs._id)},(err, requests1)=>{
                        const timckets1 =[]
                        if(requests1.length>0){
                        Users.find({ type: "local", area: mongoose.Types.ObjectId(requests1[0]._id)},(err, requests2)=>{
                            var contador=0
                            requests2.forEach( (elemento, i) => {
                                Requests.find(
                                    {
                                        $and: [
                                            { reportBy: mongoose.Types.ObjectId(elemento._id) },
                                            { status: { $nin: ["Solucionado", "SolucionadoPreventivo", "AutoSolucionado"] } },
                                            { statusCallCenter: { $nin: ["SolucionadoPreventivoCallCenter", "SolucionadoCallCenter", "AutoSolucionado"] } }
                                        ]
                                }
                                ,(err, requests3)=>{
                                    timckets1.push(requests3)
                                    contador++
                                    if(requests2.length == contador){
                                        const timckets1s =timckets1
                                        next(null, timckets1s)
                                    }
                                }).populate('issue').populate('analyst').populate({path: 'reportBy', populate:{path: 'area'}})
                            })
                        })
                    }else{
                        res.status(200).send({message:"ningun timcket"})
                    }
                    })
                },

                function step2(timckets1, next) {
                    setTimeout(()=>{
                        if(timckets1.length == 0){
                            var arrSinDuplicaciones =[]
                            res.status(200).send(arrSinDuplicaciones)
        
                        }else if(timckets1.length == 1){
                        var todos1 = [...new Set([...timckets1[0]])]
                        let set = new Set( todos1.map( JSON.stringify ) )
                        let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                        res.status(200).send(arrSinDuplicaciones)
                        
                        }else if(timckets1.length == 2){
                            var todos1 = [...new Set([...timckets1[0], ...timckets1[1]])]
                            let set = new Set( todos1.map( JSON.stringify ) )
                            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                            res.status(200).send(arrSinDuplicaciones)
        
                        }else if(timckets1.length == 3){
                            var todos1 = [...new Set([...timckets1[0], ...timckets1[1], ...timckets1[2]])]
                            let set = new Set( todos1.map( JSON.stringify ) )
                            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                            res.status(200).send(arrSinDuplicaciones)
        
                        }else if(timckets1.length == 4){
                            var todos1 = [...new Set([...timckets1[0], ...timckets1[1], ...timckets1[2], ...timckets1[3]])]
                            let set = new Set( todos1.map( JSON.stringify ) )
                            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                            res.status(200).send(arrSinDuplicaciones)
        
                        }else if(timckets1.length == 5){
                            var todos1 = [...new Set([...timckets1[0], ...timckets1[1], ...timckets1[2], ...timckets1[3], ...timckets1[4]])]
                            let set = new Set( todos1.map( JSON.stringify ) )
                            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                            res.status(200).send(arrSinDuplicaciones)
        
                        }else if(timckets1.length == 6){
                            var todos1 = [...new Set([...timckets1[0], ...timckets1[1], ...timckets1[2], ...timckets1[3], ...timckets1[4], ...timckets1[5]])]
                            let set = new Set( todos1.map( JSON.stringify ) )
                            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                            res.status(200).send(arrSinDuplicaciones)
        
                        }else if(timckets1.length == 7){
                            var todos1 = [...new Set([...timckets1[0], ...timckets1[1], ...timckets1[2], ...timckets1[3], ...timckets1[4], ...timckets1[5], ...timckets1[6]])]
                            let set = new Set( todos1.map( JSON.stringify ) )
                            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                            res.status(200).send(arrSinDuplicaciones)
        
                        }else if(timckets1.length == 8){
                            var todos1 = [...new Set([...timckets1[0], ...timckets1[1], ...timckets1[2], ...timckets1[3], ...timckets1[4], ...timckets1[5], ...timckets1[6], ...timckets1[7]])]
                            let set = new Set( todos1.map( JSON.stringify ) )
                            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                            res.status(200).send(arrSinDuplicaciones)
        
                        }else if(timckets1.length == 9){
                            var todos1 = [...new Set([...timckets1[0], ...timckets1[1], ...timckets1[2], ...timckets1[3], ...timckets1[4], ...timckets1[5], ...timckets1[6], ...timckets1[7], ...timckets1[8]])]
                            let set = new Set( todos1.map( JSON.stringify ) )
                            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                            res.status(200).send(arrSinDuplicaciones)
        
                        }else if(timckets1.length == 10){
                            var todos1 = [...new Set([...timckets1[0], ...timckets1[1], ...timckets1[2], ...timckets1[3], ...timckets1[4], ...timckets1[5], ...timckets1[6], ...timckets1[7], ...timckets1[8], ...timckets1[9]])]
                            let set = new Set( todos1.map( JSON.stringify ) )
                            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                            res.status(200).send(arrSinDuplicaciones)
        
                        }else if(timckets1.length == 11){
                            var todos1 = [...new Set([...timckets1[0], ...timckets1[1], ...timckets1[2], ...timckets1[3], ...timckets1[4], ...timckets1[5], ...timckets1[6], ...timckets1[7], ...timckets1[8], ...timckets1[9], ...timckets1[10]])]
                            let set = new Set( todos1.map( JSON.stringify ) )
                            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                            res.status(200).send(arrSinDuplicaciones)
        
                        }else if(timckets1.length == 12){
                            var todos1 = [...new Set([...timckets1[0], ...timckets1[1], ...timckets1[2], ...timckets1[3], ...timckets1[4], ...timckets1[5], ...timckets1[6], ...timckets1[7], ...timckets1[8], ...timckets1[9], ...timckets1[10], ...timckets1[11]])]
                            let set = new Set( todos1.map( JSON.stringify ) )
                            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                            res.status(200).send(arrSinDuplicaciones)
                        }
                    },1000)
                }

            ], function (err) {
                console.log(err);
            });

        } else if(req.body.type == "callCenter"){

            Requests.aggregate([
                {
                    $match: { 
                        $and:[
                            {
                                'status': {$ne: "Solucionado"} 
                            },
                            {
                                'status': {$ne: "SolucionadoPreventivo"} 
                            },
                            {
                                'status': {$ne: "AutoSolucionado"} 
                            },
                            {
                                'statusCallCenter': {$ne: "SolucionadoPreventivoCallCenter"} 
                            },
                            {
                                'statusCallCenter': {$ne: "SolucionadoCallCenter"} 
                            }, 
                            {
                                'statusCallCenter': {$ne: "AutoSolucionado"} 
                            }   
                        ],
                        $or:[
                            {
                                'statusCallCenter': "PendienteCallCenter"
                            },
                            {
                                'statusCallCenter': "NuevoCallCenter"
                            },
                        ]     
                    }
                },
                {
                    $lookup: {
                      from: "users",
                      localField: "reportBy",
                      foreignField: "_id",
                      as: "reportBy"
                    }
                  },
                  {
                    $unwind: {
                      path: "$reportBy",
                      preserveNullAndEmptyArrays: true
                    },
                  },
                  {
                    $lookup: {
                      from: "users",
                      localField: "analyst",
                      foreignField: "_id",
                      as: "analyst"
                    }
                  },
                  {
                    $unwind: {
                      path: "$analyst",
                      preserveNullAndEmptyArrays: true
                    },
                  },
                  {
                    $lookup: {
                      from: "issues",
                      localField: "issue",
                      foreignField: "_id",
                      as: "issue"
                    }
                  },
                  {
                    $unwind: {
                      path: "$issue",
                      preserveNullAndEmptyArrays: true
                    },
                  }
            ]).allowDiskUse(true).exec()
            .then(requests2 => {
                res.status(200).send(requests2)

            })
            .catch(err => {
                console.log(err);
                res.json(err).status(500).end();
            });

        } else{   // admin, superAdmin, proveedor

            // var todos =[]
            // Requests.find({"issueMore.emailToSendAnalist": mongoose.Types.ObjectId(req.body._id)},(err, requests1)=>{
            //     Requests.find({"issueMore.emailToSendCopy": mongoose.Types.ObjectId(req.body._id)},(err, requests2)=>{
            //         todos = [...new Set([...requests1, ...requests2])]
            //         let set = new Set( todos.map( JSON.stringify ) )
            //         let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
            //         res.status(200).send(arrSinDuplicaciones)
            // }).populate('reportBy issue').populate('analyst')
           
                Requests.find({
                    $or:[
                        {"issueMore.zonesToAnalyst": {$exists: false}},
                        {"issueMore.zonesToAnalyst.general": true}
                    ],
                    $and:[
                        {
                            $or:[
                                {
                                    'status': "Pendiente"
                                },
                                {
                                    'status': "Nuevo"
                                },
                                {
                                    'status': "Asignado"
                                },
                            ]     
                        },
                        {
                            $or:[
                                {"issueMore.emailToSendAnalist": mongoose.Types.ObjectId(req.body._id)},
                                {"issueMore.emailToSendCopy": mongoose.Types.ObjectId(req.body._id)}                                
                            ]
                        }
                    ]
                },(err, requests1)=>{

            Requests.aggregate([
                {
                    $match: { "issueMore.zonesToAnalyst.porEstado": true }
                },
                {
                    $lookup: {
                      from: "users",
                      localField: "reportBy",
                      foreignField: "_id",
                      as: "reportBy"
                    }
                  },
                  {
                    $unwind: {
                      path: "$reportBy",
                      preserveNullAndEmptyArrays: true
                    },
                  },
                  {
                    $match: {
                    $or:[{
                        $and:[
                            {
                                $or:[{'status': "Pendiente"}, {'status': "Nuevo"}, {'status': "Asignado"}]
                            },
                            {
                                "reportBy.state": "NuevoLeón",
                        },{
                                "issueMore.zonesNL.zonesNLAnalyst": mongoose.Types.ObjectId(req.body._id)
                        }],
                    },{
                        $and:[
                            {
                                $or:[{'status': "Pendiente"}, {'status': "Nuevo"}, {'status': "Asignado"}]
                            },
                            {
                                "reportBy.state": "NuevoLeón",
                        },{
                                "issueMore.zonesNL.zonesNLCopiados": mongoose.Types.ObjectId(req.body._id)
                        }],
                    },{
                        $and:[
                            {
                                $or:[{'status': "Pendiente"}, {'status': "Nuevo"}, {'status': "Asignado"}]
                            },
                            {
                                "reportBy.state": "Coahuila",
                        },{
                                "issueMore.zonesCoahila.zonesCoahilaAnalyst": mongoose.Types.ObjectId(req.body._id)
                        }],
                    },{
                        $and:[
                            {
                                $or:[{'status': "Pendiente"}, {'status': "Nuevo"}, {'status': "Asignado"}]
                            },
                            {
                                "reportBy.state": "Coahuila",
                        },{
                                "issueMore.zonesCoahila.zonesCoahilaCopiados": mongoose.Types.ObjectId(req.body._id)
                        }],
                    },{
                        $and:[
                            {
                                $or:[{'status': "Pendiente"}, {'status': "Nuevo"}, {'status': "Asignado"}]
                            },
                            {
                                "reportBy.state": "Querétaro",
                        },{
                                "issueMore.zonesQueretaro.zonesQueretaroAnalyst": mongoose.Types.ObjectId(req.body._id)
                        }],
                    },{
                        $and:[
                            {
                                $or:[{'status': "Pendiente"}, {'status': "Nuevo"}, {'status': "Asignado"}]
                            },
                            {
                                "reportBy.state": "Querétaro",
                        },{
                                "issueMore.zonesQueretaro.zonesQueretaroCopiados": mongoose.Types.ObjectId(req.body._id)
                        }],
                    }]
                    }
                  },
                  {
                    $lookup: {
                      from: "users",
                      localField: "analyst",
                      foreignField: "_id",
                      as: "analyst"
                    }
                  },
                  {
                    $unwind: {
                      path: "$analyst",
                      preserveNullAndEmptyArrays: true
                    },
                  },
                  {
                    $lookup: {
                      from: "issues",
                      localField: "issue",
                      foreignField: "_id",
                      as: "issue"
                    }
                  },
                  {
                    $unwind: {
                      path: "$issue",
                      preserveNullAndEmptyArrays: true
                    },
                  },
            ]).allowDiskUse(true).exec()
            .then(requests2 => {
                var todos =[]
                todos = [...new Set([...requests1, ...requests2])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );

                res.status(200).send(arrSinDuplicaciones)

            })
            .catch(err => {
                console.log(err);
                res.json(err).status(500).end();
            });
            }).populate('issue').populate('analyst').populate({path: 'reportBy', populate:{path: 'area'}})
        }
}


function allCallCenter(req, res){

    Requests.aggregate([
        {
            $match: { 
                $or:[
                    {
                        'statusCallCenter': "PendienteCallCenter"
                    },
                    {
                        'statusCallCenter': "NuevoCallCenter"
                    },
                    {
                        'status': "Pendiente"
                    },
                    {
                        'status': "Nuevo"
                    },
                    {
                        'status': "Asignado"
                    }
                ]     
            }
        },
        {
            $lookup: {
              from: "users",
              localField: "reportBy",
              foreignField: "_id",
              as: "reportBy"
            }
          },
          {
            $unwind: {
              path: "$reportBy",
              preserveNullAndEmptyArrays: true
            },
          },
          {
            $lookup: {
              from: "areas",
              localField: "reportBy.area",
              foreignField: "_id",
              as: "area"
            }
          },
          {
            $unwind: {
              path: "$area",
              preserveNullAndEmptyArrays: true
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "analyst",
              foreignField: "_id",
              as: "analyst"
            }
          },
          {
            $unwind: {
              path: "$analyst",
              preserveNullAndEmptyArrays: true
            },
          },
          {
            $lookup: {
              from: "issues",
              localField: "issue",
              foreignField: "_id",
              as: "issue"
            }
          },
          {
            $unwind: {
              path: "$issue",
              preserveNullAndEmptyArrays: true
            },
          }
    ]).allowDiskUse(true).exec()
    .then(requests2 => {
        res.status(200).send(requests2)

    })
    .catch(err => {
        console.log(err);
        res.json(err).status(500).end();
    });
}

function allSolucionadosNum(req, res){

    if(req.body.type== "superAdmin" || req.body.type=="admin" || req.body.type=="proveedor" ){
                      
        Requests.find({
            $or:[
                {"issueMore.zonesToAnalyst": {$exists: false}},
                {"issueMore.zonesToAnalyst.general": true}
            ],
            $and:[
                {                    
                    $or:[
                        {'status': 'Solucionado'},
                        {'status': 'SolucionadoPreventivo'},
                        {'status': 'AutoSolucionado'}
                    ],
                },
                {
                    $or:[
                        {"issueMore.emailToSendAnalist": mongoose.Types.ObjectId(req.body._id)},
                        {"issueMore.emailToSendCopy": mongoose.Types.ObjectId(req.body._id)}                                
                    ]
                }
            ]
        }, {codeRequest:1, dateSolution:1, dateSolutionCallCenter:1, status:1, dateOfReport:1},(err, requests1)=>{

    Requests.aggregate([
        {
            $match: { 'solutionTime.0':{$exists:true}, "issueMore.zonesToAnalyst.porEstado": true }

        },
        {
            $lookup: {
              from: "users",
              localField: "reportBy",
              foreignField: "_id",
              as: "reportBy"
            }
          },
          {
            $unwind: {
              path: "$reportBy",
              preserveNullAndEmptyArrays: true
            },
          },
          {
            $match: {

                $or:[{
                    $and:[
                        {$or:[
                            {status:'Solucionado'},
                            {status:'SolucionadoPreventivo'},
                            {status: 'AutoSolucionado'}
                        ]}    
                        ,{
                            "reportBy.state": "NuevoLeón",
                    },{
                            "issueMore.zonesNL.zonesNLAnalyst": mongoose.Types.ObjectId(req.body._id)
                    }],
                },
                {
                $and:[
                    {$or:[
                        {status:'Solucionado'},
                        {status:'SolucionadoPreventivo'},
                        {status: 'AutoSolucionado'}
                    ]}    
                    ,{
                        "reportBy.state": "NuevoLeón",
                },{
                        "issueMore.zonesNL.zonesNLCopiados": mongoose.Types.ObjectId(req.body._id)
                }],
                },
                {
                    $and:[
                        {$or:[
                            {status:'Solucionado'},
                            {status:'SolucionadoPreventivo'},
                            {status: 'AutoSolucionado'}
                        ]}    
                        ,{
                            "reportBy.state": "Coahuila",
                    },{
                            "issueMore.zonesCoahila.zonesCoahilaAnalyst": mongoose.Types.ObjectId(req.body._id)
                    }],
                    },
                    {
                        $and:[
                            {$or:[
                                {status:'Solucionado'},
                                {status:'SolucionadoPreventivo'},
                                {status: 'AutoSolucionado'}
                            ]}    
                            ,{
                                "reportBy.state": "Coahuila",
                        },{
                                "issueMore.zonesCoahila.zonesCoahilaCopiados": mongoose.Types.ObjectId(req.body._id)
                        }],
                        },
                        {
                            $and:[
                                {$or:[
                                    {status:'Solucionado'},
                                    {status:'SolucionadoPreventivo'},
                                    {status: 'AutoSolucionado'}
                                ]}    
                                ,{
                                    "reportBy.state": "Querétaro",
                            },{
                                    "issueMore.zonesQueretaro.zonesQueretaroAnalyst": mongoose.Types.ObjectId(req.body._id)
                            }],
                            },
                            {
                                $and:[
                                    {$or:[
                                        {status:'Solucionado'},
                                        {status:'SolucionadoPreventivo'},
                                        {status: 'AutoSolucionado'}
                                    ]}    
                                    ,{
                                        "reportBy.state": "Querétaro",
                                },{
                                        "issueMore.zonesQueretaro.zonesQueretaroCopiados": mongoose.Types.ObjectId(req.body._id)
                                }],
                            },
            ]
            }
          },
          {
           $project:{
            codeRequest:1,
            dateSolution:1,
            dateOfReport:1,
            status:1,
            dateSolutionCallCenter:1,
           } 
          },
          {
            $sort:{
                dateSolution:1
            }
          }
    ]).allowDiskUse(true).exec()
    .then(requests2 => {
        var todos =[]
        todos = [...new Set([...requests1, ...requests2])]
        let set = new Set( todos.map( JSON.stringify ) )
        let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );

        res.status(200).send(arrSinDuplicaciones)

    })
    .catch(err => {
        console.log(err);
        res.json(err).status(500).end();
    });
    })
    }else if(req.body.type=="callCenter"){
        
        Requests.find({
            $or:[
                {'statusCallCenter': 'SolucionadoCallCenter'},
                {'statusCallCenter': 'SolucionadoPreventivoCallCenter'},
                {'statusCallCenter': 'AutoSolucionado'},
            ],
    },(err, requests)=>{
            res.status(200).send(requests)
        })


    }else if(req.body.type=="areaManager"){
        
        const reqs = req.body
        async.waterfall([
            function step1(next) {

    Areas.find({responsable: mongoose.Types.ObjectId(reqs._id)},(err, requests1)=>{
        const timckets2 =[]
        Users.find({ type: "local", area: requests1[0]._id},(err, requests2)=>{
            var contador = 0  
        for(var i=0; i<requests2.length; i++){
            Requests.find(
                {
                    reportBy: requests2[i]._id,
                    $or:[
                        {'status': 'Solucionado'},
                        {'status': 'SolucionadoPreventivo'},
                        {'status': 'AutoSolucionado'},
                        {'statusCallCenter': 'SolucionadoCallCenter'},
                        {'statusCallCenter': 'SolucionadoPreventivoCallCenter'},
                        {'statusCallCenter': 'AutoSolucionado'},
                    ]
                },(err, requests3)=>{
                timckets2.push(requests3)
                contador++
                if(requests2.length == contador){
                    const timckets2s =timckets2
                    next(null, timckets2s)
                }
            }).populate('issue').populate('analyst').populate({path: 'reportBy', populate:{path: 'area'}})
        }
    })
})
},

function step2(timckets2, next) {
        setTimeout(()=>{
            if(timckets2.length == 0){
                var arrSinDuplicaciones =[]
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 1){
            var todos = [...new Set([...timckets2[0]])]
            let set = new Set( todos.map( JSON.stringify ) )
            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
            res.status(200).send(arrSinDuplicaciones)
            
            }else if(timckets2.length == 2){
                var todos = [...new Set([...timckets2[0], ...timckets2[1]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 3){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 4){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 5){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 6){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 7){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 8){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6], ...timckets2[7]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 9){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6], ...timckets2[7], ...timckets2[8]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 10){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6], ...timckets2[7], ...timckets2[8], ...timckets2[9]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 11){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6], ...timckets2[7], ...timckets2[8], ...timckets2[9], ...timckets2[10]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 12){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6], ...timckets2[7], ...timckets2[8], ...timckets2[9], ...timckets2[10], ...timckets2[11]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)
            }
        },500)
    }

], function (err) {
    console.log(err);
});

    }


}

function allSolucionados(req, res){
    if(req.body.type == "local"){
        Requests.find(
            {
                reportBy: req.body._id,
                $or:[
                    {'status': 'Solucionado'},
                    {'status': 'SolucionadoPreventivo'},
                    {'status': 'AutoSolucionado'},
                    {'statusCallCenter': 'SolucionadoCallCenter'},
                    {'statusCallCenter': 'SolucionadoPreventivoCallCenter'},
                    {'statusCallCenter': 'AutoSolucionado'},
                ]
            },(err, requests)=>{
            res.status(200).send(requests)
        }).populate('issue').populate('analyst').populate({path: 'reportBy', populate:{path: 'area'}})
        
    }else if(req.body.type == "areaManager"){  
        
        const reqs = req.body
        async.waterfall([
            function step1(next) {

    Areas.find({responsable: mongoose.Types.ObjectId(reqs._id)},(err, requests1)=>{
        const timckets2 =[]
        Users.find({ type: "local", area: requests1[0]._id},(err, requests2)=>{    
        for(var i=0; i<requests2.length; i++){
            Requests.find(
                {
                    reportBy: requests2[i]._id,
                    $or:[
                        {'status': 'Solucionado'},
                        {'status': 'SolucionadoPreventivo'},
                        {'status': 'AutoSolucionado'},
                        {'statusCallCenter': 'SolucionadoCallCenter'},
                        {'statusCallCenter': 'SolucionadoPreventivoCallCenter'},
                        {'statusCallCenter': 'AutoSolucionado'},
                    ]
                },(err, requests3)=>{
                timckets2.push(requests3)
            }).populate('issue').populate('analyst').populate({path: 'reportBy', populate:{path: 'area'}})
        }
                            
        setTimeout(()=>{
            const timckets2s =timckets2
            next(null, timckets2s)
        },1000)
    })
})
},

function step2(timckets2, next) {
        setTimeout(()=>{
            if(timckets2.length == 0){
                var arrSinDuplicaciones =[]
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 1){
            var todos = [...new Set([...timckets2[0]])]
            let set = new Set( todos.map( JSON.stringify ) )
            let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
            res.status(200).send(arrSinDuplicaciones)
            
            }else if(timckets2.length == 2){
                var todos = [...new Set([...timckets2[0], ...timckets2[1]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 3){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 4){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 5){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 6){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 7){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 8){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6], ...timckets2[7]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 9){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6], ...timckets2[7], ...timckets2[8]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 10){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6], ...timckets2[7], ...timckets2[8], ...timckets2[9]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 11){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6], ...timckets2[7], ...timckets2[8], ...timckets2[9], ...timckets2[10]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)

            }else if(timckets2.length == 12){
                var todos = [...new Set([...timckets2[0], ...timckets2[1], ...timckets2[2], ...timckets2[3], ...timckets2[4], ...timckets2[5], ...timckets2[6], ...timckets2[7], ...timckets2[8], ...timckets2[9], ...timckets2[10], ...timckets2[11]])]
                let set = new Set( todos.map( JSON.stringify ) )
                let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
                res.status(200).send(arrSinDuplicaciones)
            }
        },500)
    }

], function (err) {
    console.log(err);
});


    } else{   // admin, superAdmin, proveedor

        // var todos =[]
        // Requests.find({status:'Solucionado', "issueMore.emailToSendAnalist": mongoose.Types.ObjectId(req.body._id)},(err, requests1)=>{
        //     Requests.find({status:'Solucionado', "issueMore.emailToSendCopy": mongoose.Types.ObjectId(req.body._id)},(err, requests2)=>{
        //         todos = [...new Set([...requests1, ...requests2])]
        //         let set = new Set( todos.map( JSON.stringify ) )
        //         let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );
        //         res.status(200).send(arrSinDuplicaciones)
        //     }).populate('reportBy issue').populate('analyst')
        // }).populate('reportBy issue').populate('analyst')

                   
        Requests.find({
            $or:[
                {"issueMore.zonesToAnalyst": {$exists: false}},
                {"issueMore.zonesToAnalyst.general": true}
            ],
            $and:[
                {                    
                    $or:[
                        {'status': 'Solucionado'},
                        {'status': 'SolucionadoPreventivo'},
                        {'status': 'AutoSolucionado'},
                        {'statusCallCenter': 'SolucionadoCallCenter'},
                        {'statusCallCenter': 'SolucionadoPreventivoCallCenter'},
                        {'statusCallCenter': 'AutoSolucionado'},
                    ],
                },
                {
                    $or:[
                        {"issueMore.emailToSendAnalist": mongoose.Types.ObjectId(req.body._id)},
                        {"issueMore.emailToSendCopy": mongoose.Types.ObjectId(req.body._id)}                                
                    ]
                }
            ]
        },(err, requests1)=>{

    Requests.aggregate([
        {
            $match: { 'solutionTime.0':{$exists:true},"issueMore.zonesToAnalyst.porEstado": true }
        },
        {
            $lookup: {
              from: "users",
              localField: "reportBy",
              foreignField: "_id",
              as: "reportBy"
            }
          },
          {
            $unwind: {
              path: "$reportBy",
              preserveNullAndEmptyArrays: true
            },
          },
          {
            $match: {
            $or:[{
                $and:[
                    {$or:[
                        {status:'Solucionado'},
                        {status:'SolucionadoPreventivo'},
                        {status: 'AutoSolucionado'}
                    ]}    
                    ,{
                        "reportBy.state": "NuevoLeón",
                },{
                        "issueMore.zonesNL.zonesNLAnalyst": mongoose.Types.ObjectId(req.body._id)
                }],
            },
            {
            $and:[
                {$or:[
                    {status:'Solucionado'},
                    {status:'SolucionadoPreventivo'},
                    {status: 'AutoSolucionado'}
                ]}    
                ,{
                    "reportBy.state": "NuevoLeón",
            },{
                    "issueMore.zonesNL.zonesNLCopiados": mongoose.Types.ObjectId(req.body._id)
            }],
            },
            {
                $and:[
                    {$or:[
                        {status:'Solucionado'},
                        {status:'SolucionadoPreventivo'},
                        {status: 'AutoSolucionado'}
                    ]}    
                    ,{
                        "reportBy.state": "Coahuila",
                },{
                        "issueMore.zonesCoahila.zonesCoahilaAnalyst": mongoose.Types.ObjectId(req.body._id)
                }],
                },
                {
                    $and:[
                        {$or:[
                            {status:'Solucionado'},
                            {status:'SolucionadoPreventivo'},
                            {status: 'AutoSolucionado'}
                        ]}    
                        ,{
                            "reportBy.state": "Coahuila",
                    },{
                            "issueMore.zonesCoahila.zonesCoahilaCopiados": mongoose.Types.ObjectId(req.body._id)
                    }],
                    },
                    {
                        $and:[
                            {$or:[
                                {status:'Solucionado'},
                                {status:'SolucionadoPreventivo'},
                                {status: 'AutoSolucionado'}
                            ]}    
                            ,{
                                "reportBy.state": "Querétaro",
                        },{
                                "issueMore.zonesQueretaro.zonesQueretaroAnalyst": mongoose.Types.ObjectId(req.body._id)
                        }],
                        },
                        {
                            $and:[
                                {$or:[
                                    {status:'Solucionado'},
                                    {status:'SolucionadoPreventivo'},
                                    {status: 'AutoSolucionado'}
                                ]}    
                                ,{
                                    "reportBy.state": "Querétaro",
                            },{
                                    "issueMore.zonesQueretaro.zonesQueretaroCopiados": mongoose.Types.ObjectId(req.body._id)
                            }],
                        },
        ]
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "analyst",
              foreignField: "_id",
              as: "analyst"
            }
          },
          {
            $unwind: {
              path: "$analyst",
              preserveNullAndEmptyArrays: true
            },
          },
          {
            $lookup: {
              from: "issues",
              localField: "issue",
              foreignField: "_id",
              as: "issue"
            }
          },
          {
            $unwind: {
              path: "$issue",
              preserveNullAndEmptyArrays: true
            },
          },
    ]).allowDiskUse(true).exec()
    .then(requests2 => {
        var todos =[]
        todos = [...new Set([...requests1, ...requests2])]
        let set = new Set( todos.map( JSON.stringify ) )
        let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );

        res.status(200).send(arrSinDuplicaciones)

    })
    .catch(err => {
        console.log(err);
        res.json(err).status(500).end();
    });
    }).populate('issue').populate('analyst').populate({path: 'reportBy', populate:{path: 'area'}})



    }

}


function allHistory(req, res){
    if(req.body.type == "superAdmin" || req.body.type == "admin" || req.body.type == "callCenter"){
        Requests.find({
            $and:[
                {'status': {$ne:'Solucionado'}},
                {'status': {$ne:'SolucionadoPreventivo'}},
                {'status': {$ne:'AutoSolucionado'}},
                {'statusCallCenter': {$ne:'SolucionadoCallCenter'}},
                {'statusCallCenter': {$ne:'SolucionadoPreventivoCallCenter'}},
                {'statusCallCenter': {$ne:'AutoSolucionado'}},
            ]
        },(err, requests1)=>{
            if(requests1 && requests1[0]){
                requests1[0].tiempoAPI = moment().tz('America/Monterrey')
            }
            res.status(200).send(requests1)
        }).populate({path: 'reportBy', populate:{path: 'area'}}).populate({path:'issue', populate:{path: 'emailToSendAnalist'}}).populate('analyst')
    } else{   // admin, superAdmin, proveedor
        res.status(400).send({message: 'No se pudo'})
    }
}

function allHistorySolucionado(req, res){
    if(req.body && req.body.dataFecha && req.body.dataFecha.tiempo1){
        var tiempo1= moment(req.body.dataFecha.tiempo1).tz('America/Monterrey');
        var tiempo2= moment(req.body.dataFecha.tiempo2).tz('America/Monterrey');
    }else{
        var tiempo1= moment('2022-01-01T00:00:00-06:00').tz('America/Monterrey');
        var tiempo2= moment().tz('America/Monterrey');
    }
    tiempo1= tiempo1.toDate()
    tiempo2= tiempo2.toDate()

    if(req.body.type == "superAdmin" || req.body.type == "admin" || req.body.type == "callCenter"){
        Requests.find({
            'dateOfReport':{$gte: tiempo1 , $lte: tiempo2},
            $or:[
                {'status': 'Solucionado'},
                {'status': 'SolucionadoPreventivo'},
                {'status': 'AutoSolucionado'},
                {'statusCallCenter': 'SolucionadoCallCenter'},
                {'statusCallCenter': 'SolucionadoPreventivoCallCenter'},
                {'statusCallCenter': 'AutoSolucionado'},
            ]
        },(err, requests1)=>{
            if(requests1){
            if(requests1[0]){
                requests1[0].tiempoAPI = moment().tz('America/Monterrey')
            }
        }
            res.status(200).send(requests1)
        }).populate({path: 'reportBy', populate:{path: 'area'}}).populate({path:'issue', populate:{path: 'emailToSendAnalist'}}).populate('analyst')
    } else{   // admin, superAdmin, proveedor
        res.status(400).send({message: 'No se pudo'})
    }
}

function allHistoryDepartments(req, res){
    if(req.body.type == "superAdmin" || req.body.type == "admin" || req.body.type == "callCenter"){
        Requests.find({
            $and:[
                {'department': req.body.department._id},
                {'status': {$ne:'Solucionado'}},
                {'status': {$ne:'SolucionadoPreventivo'}},
                {'status': {$ne:'AutoSolucionado'}},
                {'statusCallCenter': {$ne:'SolucionadoCallCenter'}},
                {'statusCallCenter': {$ne:'SolucionadoPreventivoCallCenter'}},
                {'statusCallCenter': {$ne:'AutoSolucionado'}},
            ]
        },(err, requests1)=>{
            if(requests1 && requests1[0]){
                requests1[0].tiempoAPI = moment().tz('America/Monterrey')
            }
            res.status(200).send(requests1)
        }).populate({path: 'reportBy', populate:{path: 'area'}}).populate({path:'issue', populate:{path: 'emailToSendAnalist'}}).populate('analyst')
    } else{   // admin, superAdmin, proveedor
        res.status(400).send({message: 'No se pudo'})
    }
}

function allHistorySolucionadoDepartments(req, res){
    if(req.body && req.body.dataFecha && req.body.dataFecha.tiempo1){
        var tiempo1= moment(req.body.dataFecha.tiempo1).tz('America/Monterrey');
        var tiempo2= moment(req.body.dataFecha.tiempo2).tz('America/Monterrey');
    }else{
        var tiempo1= moment('2022-01-01T00:00:00-06:00').tz('America/Monterrey');
        var tiempo2= moment().tz('America/Monterrey');
    }
    tiempo1= tiempo1.toDate()
    tiempo2= tiempo2.toDate()

    if(req.body.type == "superAdmin" || req.body.type == "admin" || req.body.type == "callCenter"){
        Requests.find({
            $or:[
                {'status': 'Solucionado'},
                {'status': 'SolucionadoPreventivo'},
                {'status': 'AutoSolucionado'},
                {'statusCallCenter': 'SolucionadoCallCenter'},
                {'statusCallCenter': 'SolucionadoPreventivoCallCenter'},
                {'statusCallCenter': 'AutoSolucionado'},
            ],
            'dateOfReport':{$gte: tiempo1 , $lte: tiempo2},
            'department': req.body.department._id,
        },(err, requests1)=>{
            if(requests1){
            if(requests1[0]){
                requests1[0].tiempoAPI = moment().tz('America/Monterrey')
            }
        }
            res.status(200).send(requests1)
        }).populate({path: 'reportBy', populate:{path: 'area'}}).populate({path:'issue', populate:{path: 'emailToSendAnalist'}}).populate('analyst')
    } else{   // admin, superAdmin, proveedor
        res.status(400).send({message: 'No se pudo'})
    }
}

function prueba(req, res){
    
    Issues.findById(req.body.issue,{},(err, requests3)=>{
        req.body.issueMore = requests3

    // Solo IT, CapexS, OPS, Construcción y finanzas
    if((req.body.department._id == '62f1a82422e803510bacee97' && req.body.issueMore && req.body.issueMore.slaCallCenter && req.body.issueMore.slaCallCenter != 0) || (req.body.department._id == '62f2c60e5b1ab6024e9fdfb6' && req.body.issueMore && req.body.issueMore.slaCallCenter && req.body.issueMore.slaCallCenter != 0) || (req.body.department._id == '62f2c5bc5b1ab6024e9fdfb4' && req.body.issueMore && req.body.issueMore.slaCallCenter && req.body.issueMore.slaCallCenter != 0) || (req.body.department._id == '654d535e202f4f099f5eff42' && req.body.issueMore && req.body.issueMore.slaCallCenter && req.body.issueMore.slaCallCenter != 0) || (req.body.department._id == '62f61a9bf0c12707fb52ea75' && req.body.issueMore && req.body.issueMore.slaCallCenter && req.body.issueMore.slaCallCenter != 0) ){

        async.waterfall([
            function step1(next) {
                if(req.body.reportBy && req.body.reportBy.name){ req.body.sucursalName= req.body.reportBy.name }
                req.body.reportByMore = req.body.reportBy
                req.body.reportBy = req.body.reportBy._id
                req.body.statusCallCenter = "NuevoCallCenter"
                    var numberOfMlSeconds = new Date
                    var addMlSeconds = (6 * 60) * 60000;
                    var newDateObj = new Date(numberOfMlSeconds - addMlSeconds);
                req.body.newdateOfReportUnformatted = newDateObj
                if(req.body.reportByMore.name == undefined) req.body.reportByMore.name = req.body.reportByMore.fname + " " + req.body.reportByMore.lname

                Requests.find({"codeRequest": {'$regex': req.body.department.shortName}},(err, requests)=>{
                    if(requests && requests[requests.length-1] && (requests[requests.length-1].consecutive || requests[requests.length-1].consecutive == '0')){
                        req.body.consecutive = (requests[requests.length-1].consecutive) + 1
                        req.body.codeRequest = req.body.department.shortName+"-"+req.body.consecutive
                        req.body.department= req.body.issueMore.departments
                        next(null, req.body)
                    } else {
                        req.body.consecutive = 1
                        req.body.codeRequest = req.body.department.shortName + "-" + 1
                        req.body.department= req.body.issueMore.departments
                        next(null, req.body)
                    }
                }).populate('issue').sort("consecutive").populate({path: 'reportBy', populate:{path: 'area'}})
            },

            function step2(body, next) {
            Users.find({'type': 'callCenter'},(err, requests4)=>{
                var emailToSend= body.reportByMore.email+ ';'
                if(requests4 && requests4[0]){
                    async function processEmails() {
                        for (let i = 0; i < requests4.length; i++) {
                            emailToSend += requests4[i].email + ";";
                        }
                        return emailToSend;
                    }
                    
                    processEmails()
                        .then(emails => {
                            next(null, body, emails)
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }
            })
            },

            function step3(body,emails, next) {
                    var requests = new Requests(body);
                    requests.save((err, userStored)=>{
                        if(err){
                            res.status(500).send({message: 'Error al guardar el usuario'})
                        } else{
                            if(!userStored){
                                res.status(404).send({message: 'No se pudo registrar el usuario'})
                            } else{
                         res.status(200).send({users: userStored})

                    var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
                    // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://timckets.timhortonsmx.com/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="http://timckets.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
                    // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="http://localhost:4200/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>     <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'

                    HTML = HTML.replace("<CodeRequest>", body.codeRequest);
                    HTML = HTML.replace("<CodeRequest2>", body.codeRequest);
                    HTML = HTML.replace("<CodeRequest3>", body.codeRequest);
                    HTML = HTML.replace("<CodeRequest4>", body.codeRequest);
                    HTML = HTML.replace("<SubCategory>", body.subcategory);
                    HTML = HTML.replace("<Service>", body.service);
                    HTML = HTML.replace("<Description>", body.description);
                    HTML = HTML.replace("<ReportBy>", body.reportByMore.name);
                    HTML = HTML.replace("<Direccion>", body.reportByMore.street + " " + body.reportByMore.numExt + " " + body.reportByMore.numInt + " " + body.reportByMore.suburb + " " + body.reportByMore.municipality + " " + body.reportByMore.state);

                return transporter.sendMail({
                    from: '...@....',
                    to: emails,
                    subject: 'Nuevo Timcket ' + body.codeRequest +' | '+ body.issueMore.subcategory, // Subject line
                    html: HTML
                  }, function (error, info) {
                    console.log("enviado a: " + emails)
                  })

                }
            }
            })
            }

        ], function (err) {
            console.log(err);
        });
        
    // Cuando levanten timcket de los demas departamentos
    }else{

        async.waterfall([
            function step1(next) {
    if(req.body.reportBy && req.body.reportBy.name){ req.body.sucursalName= req.body.reportBy.name }
    req.body.reportByMore = req.body.reportBy
    req.body.reportBy = req.body.reportBy._id
    req.body.status = "Nuevo"
        var numberOfMlSeconds = new Date
        var addMlSeconds = (6 * 60) * 60000;
        var newDateObj = new Date(numberOfMlSeconds - addMlSeconds);
    req.body.newdateOfReportUnformatted = newDateObj
    if(req.body.reportByMore.name == undefined) req.body.reportByMore.name = req.body.reportByMore.fname + " " + req.body.reportByMore.lname

        Requests.find({"codeRequest": {'$regex': req.body.department.shortName}},(err, requests)=>{
            if(requests[requests.length-1] && (requests[requests.length-1].consecutive || requests[requests.length-1].consecutive == '0')){
                req.body.consecutive = (requests[requests.length-1].consecutive) + 1
            req.body.codeRequest = req.body.department.shortName+"-"+req.body.consecutive
            req.body.department= req.body.issueMore.departments
            next(null, req.body)
            } else {
                req.body.consecutive = 1
                req.body.codeRequest = req.body.department.shortName + "-" + 1
                req.body.department= req.body.issueMore.departments
                next(null, req.body)
            }
        }).populate('issue').sort("consecutive").populate({path: 'reportBy', populate:{path: 'area'}})
    },

            function step2(body, next) {
                    if(body.issueMore.zonesToAnalyst && body.issueMore.zonesToAnalyst.porEstado == true){
                        if(body.reportByMore && body.reportByMore.state){
                            if(body.reportByMore.state =="NuevoLeón"){
                                body.issueMore.emailToSendAnalist = body.issueMore.zonesNL.zonesNLAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                body.issueMore.emailToSendCopy = body.issueMore.zonesNL.zonesNLCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                next(null, body, body)
                            }
                
                            if(body.reportByMore.state =="Coahuila"){
                                body.issueMore.emailToSendAnalist = body.issueMore.zonesCoahila.zonesCoahilaAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                body.issueMore.emailToSendCopy = body.issueMore.zonesCoahila.zonesCoahilaCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                next(null, body, body)
                            }
                
                            if(body.reportByMore.state =="Querétaro"){
                                body.issueMore.emailToSendAnalist = body.issueMore.zonesQueretaro.zonesQueretaroAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                body.issueMore.emailToSendCopy = body.issueMore.zonesQueretaro.zonesQueretaroCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                next(null, body, body)
                            }
                
                            if(body.reportByMore.state =="Estado-de-México"){
                                body.issueMore.emailToSendAnalist = body.issueMore.zonesMexico.zonesMexicoAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                body.issueMore.emailToSendCopy = body.issueMore.zonesMexico.zonesMexicoCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                next(null, body, body)
                            }
                        }
                    }else {
                                body.sendsAnalist = body.issueMore.emailToSendAnalist.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                body.sendsCopy = body.issueMore.emailToSendCopy.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                next(null, body, body)
                    }
                },

                function step3(body, nop, next) {
                                    async function getEmails(usersArray) {
                                        const emails = [];
                                        for (let y = 0; y < usersArray.length; y++) {
                                          if (usersArray[y] !== null) {
                                            const requests = await Users.findById(usersArray[y], {});
                                            emails.push(requests.email);
                                          }
                                        }
                                        return emails.join(';');
                                      }
                                      async function main() {
                                        var textAnalist= ''
                                        let textCopy = "";
                                        if (body.issueMore.emailToSendAnalist && body.issueMore.emailToSendAnalist[0] != null) {
                                          textAnalist = await getEmails(body.issueMore.emailToSendAnalist);
                                        }
                                        if (body.issueMore.emailToSendCopy && body.issueMore.emailToSendCopy[0] != null) {
                                          textCopy = await getEmails(body.issueMore.emailToSendCopy);
                                        }
                                        var email={
                                            textAnalist: body.reportByMore.email+ ';'+textAnalist,
                                            textCopy: textCopy
                                        }
                                
                                        setTimeout(()=>{
                                            next(null, body, body, email)
                                        }, 3000)
                                      }
                                      main();
                                    },


                function step4(body, nop, email, next) {
                        var requests = new Requests(body);
                        requests.save((err, userStored)=>{
                            if(err){
                                res.status(500).send({message: 'Error al guardar el usuario'})
                            } else{
                                if(!userStored){
                                    res.status(404).send({message: 'No se pudo registrar el usuario'})
                                } else{

                             res.status(200).send({users: userStored})

                        var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
                        // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://timckets.timhortonsmx.com/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="http://timckets.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
                        // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="http://localhost:4200/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>     <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'

                        HTML = HTML.replace("<CodeRequest>", body.codeRequest);
                        HTML = HTML.replace("<CodeRequest2>", body.codeRequest);
                        HTML = HTML.replace("<CodeRequest3>", body.codeRequest);
                        HTML = HTML.replace("<CodeRequest4>", body.codeRequest);
                        HTML = HTML.replace("<SubCategory>", body.subCategory);
                        HTML = HTML.replace("<Service>", body.service);
                        HTML = HTML.replace("<Description>", body.description);
                        HTML = HTML.replace("<ReportBy>", body.reportByMore.name);
                        HTML = HTML.replace("<Direccion>", body.reportByMore.street + " " + body.reportByMore.numExt + " " + body.reportByMore.numInt + " " + body.reportByMore.suburb + " " + body.reportByMore.municipality + " " + body.reportByMore.state);

                    return transporter.sendMail({
                        from: ' ...@....',
                        to: email.textAnalist,
                        cc: email.textCopy,
                        subject: 'Nuevo Timcket ' + body.codeRequest +' | '+ body.issueMore.subcategory, // Subject line
                        html: HTML
                      }, function (error, info) {
                        console.log("enviado a: " + email.textAnalist + " y cc: " + email.textCopy)
                      })
                    }
                }
                })
    }

], function (err) {
    console.log(err);
});
    }
})
}

    function allSolucionadosCallCenter(req, res){
        Requests.find({'statusCallCenter': 'SolucionadoCallCenter'},(err, requests)=>{
            var reqs = {}
            if(requests){
                reqs = {reqs :requests.length}
            }
            res.status(200).send(reqs)

        })
    }

    function allSolucionadosCallCenter2(req, res){
        Requests.find({
            $or:[
                {'status': 'Solucionado'},
                {'status': 'SolucionadoPreventivo'},
                {'status': 'AutoSolucionado'},
                {'statusCallCenter': 'SolucionadoCallCenter'},
                {'statusCallCenter': 'SolucionadoPreventivoCallCenter'},
                {'statusCallCenter': 'AutoSolucionado'},

            ],
    },(err, requests)=>{
            res.status(200).send(requests)
        }).populate('issue').populate('analyst').populate({path: 'reportBy', populate:{path: 'area'}})
    }

function enviarCorreoNuevo(req, res){
}

function uploadImage(req, res){
    var userId = req.params._id
    var file_name = 'No subido...'
    if(req.files){
        var file_path = req.files.image.path.split(/[\\/.]+/g)
        if(file_path[file_path.length-1] == 'png' || file_path[file_path.length-1] == 'PNG' || file_path[file_path.length-1] == 'jpg' || file_path[file_path.length-1] == 'jpeg' || file_path[file_path.length-1] == 'gif' || file_path[file_path.length-1] == 'mp4'|| file_path[file_path.length-1] == 'mov' || file_path[file_path.length-1] == 'avi' || file_path[file_path.length-1] == 'pdf' || file_path[file_path.length-1] == 'xls' || file_path[file_path.length-1] == 'xlsx' || file_path[file_path.length-1] == 'csv' || file_path[file_path.length-1] == 'doc' || file_path[file_path.length-1] == 'docx' || file_path[file_path.length-1] == 'ppt' || file_path[file_path.length-1] == 'pptx' || file_path[file_path.length-1] == 'txt'){
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
    var path_file = './uploads/requests/' + imageFile

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file))
        } else{
        res.status(200).send({message: 'No existe imagen'})
    }
    })
}

function uploadImageAfter(req, res){
    var file_name = 'No subido...'
    if(req.files){
        var file_path = req.files.image.path.split(/[\\/.]+/g)
        if(file_path[file_path.length-1] == 'png' || file_path[file_path.length-1] == 'PNG' || file_path[file_path.length-1] == 'jpg' || file_path[file_path.length-1] == 'jpeg' || file_path[file_path.length-1] == 'gif' || file_path[file_path.length-1] == 'mp4'|| file_path[file_path.length-1] == 'mov' || file_path[file_path.length-1] == 'avi' || file_path[file_path.length-1] == 'pdf' || file_path[file_path.length-1] == 'xls' || file_path[file_path.length-1] == 'xlsx' || file_path[file_path.length-1] == 'csv' || file_path[file_path.length-1] == 'doc' || file_path[file_path.length-1] == 'docx' || file_path[file_path.length-1] == 'ppt' || file_path[file_path.length-1] == 'pptx' || file_path[file_path.length-1] == 'txt'){
            res.status(200).send({img: file_path[2] + "." + file_path[file_path.length-1], ext: file_path[file_path.length-1], date:  new Date(), user: req.params.id})
        } else{
            res.status(200).send({message: 'Extencion del archivo no valido'})
        }
    } else{
        res.status(200).send({message: 'No has subido ninguna imagen'})
    }
}

function addNote(req, res){

    const reqs = req.body
    async.waterfall([
        function step1(next) {

            if(reqs.esperaRespuesta && reqs.typeIdentity!="local"){
            }else{
                reqs.esperaRespuesta = null
            }

            reqs.textAnalist = reqs.reportBy.email+ ';'
            reqs.textCopy = ''
            if(reqs.status && (reqs.status=='Nuevo' || reqs.status=='Asignado' || reqs.status=='Pendiente')){

                if(reqs.issueMore.zonesToAnalyst && reqs.issueMore.zonesToAnalyst.porEstado == true){
                    if(reqs.reportBy && reqs.reportBy.state){

                        if(reqs.reportBy.state =="NuevoLeón"){
                            reqs.issueMore.emailToSendAnalist = reqs.issueMore.zonesNL.zonesNLAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                            reqs.issueMore.emailToSendCopy = reqs.issueMore.zonesNL.zonesNLCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                            reqs.issueMore.zonesNL.zonesNLAnalyst= reqs.issueMore.emailToSendAnalist
                            reqs.issueMore.zonesNL.zonesNLCopiados= reqs.issueMore.emailToSendCopy
                            next(null, reqs)
                        }
                
                        if(reqs.reportBy.state =="Coahuila"){
                            reqs.issueMore.emailToSendAnalist = reqs.issueMore.zonesCoahila.zonesCoahilaAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                            reqs.issueMore.emailToSendCopy = reqs.issueMore.zonesCoahila.zonesCoahilaCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                            reqs.issueMore.zonesCoahila.zonesCoahilaAnalyst= reqs.issueMore.emailToSendAnalist
                            reqs.issueMore.zonesCoahila.zonesCoahilaCopiados= reqs.issueMore.emailToSendCopy
                            next(null, reqs)
                        }
                
                        if(reqs.reportBy.state =="Querétaro"){
                            reqs.issueMore.emailToSendAnalist = reqs.issueMore.zonesQueretaro.zonesQueretaroAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                            reqs.issueMore.emailToSendCopy = reqs.issueMore.zonesQueretaro.zonesQueretaroCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                            reqs.issueMore.zonesQueretaro.zonesQueretaroAnalyst= reqs.issueMore.emailToSendAnalist
                            reqs.issueMore.zonesQueretaro.zonesQueretaroCopiados= reqs.issueMore.emailToSendCopy
                            next(null, reqs)
                        }
                
                        if(reqs.reportBy.state =="Estado-de-México"){
                            reqs.issueMore.emailToSendAnalist = reqs.issueMore.zonesMexico.zonesMexicoAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                            reqs.issueMore.emailToSendCopy = reqs.issueMore.zonesMexico.zonesMexicoCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                            reqs.issueMore.zonesMexico.zonesMexicoAnalyst= reqs.issueMore.emailToSendAnalist
                            reqs.issueMore.zonesMexico.zonesMexicoCopiados= reqs.issueMore.emailToSendCopy
                            next(null, reqs)
                        }

        }
    }else {
        reqs.issueMore.emailToSendAnalist = reqs.issueMore.emailToSendAnalist.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
        reqs.issueMore.emailToSendCopy = reqs.issueMore.emailToSendCopy.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
        next(null, reqs)
    }

        }else{
            Users.find({'type': 'callCenter'},(err, requests4)=>{
                if (err) {
                    console.error(err);
                    return;
                  }
                  var emails = requests4.map(request => request.email);
                  reqs.textAnalist = emails.join(';');
                  next(null, reqs)
            })
        }
        },

        function step2(reqs, next){
            if(reqs.status && (reqs.status=='Nuevo' || reqs.status=='Asignado' || reqs.status=='Pendiente')){
                if (reqs.reportBy.name.includes("Call ")) {
                    Users.find({'type': 'callCenter'},(err, requests4)=>{
                        if (err) {
                            console.error(err);
                            return;
                        }
                        var emails = requests4.map(request => request.email);
                        var textAnalist = emails.join(';');
                        reqs.textAnalist = reqs.reportBy.email+";"+ textAnalist
                        sig()
                    })
                } else {
                    sig()
                }

                async function sig() {
                if(reqs.notes && reqs.notes[0]){
                    var cc=0
                    reqs.notes.forEach((element, i)=>{
                        if(element.noteBy.includes("Call ")){
                            if((moment(element.dateOfNote).tz('America/Monterrey').format('YYYY/MM/DD HH:mm:ss')) > (moment(reqs.dateAssignmentCallCenter).tz('America/Monterrey').format('YYYY/MM/DD HH:mm:ss'))){
                                reqs.ccEmail= "si"
                            }
                        }

                    })
                    next(null, reqs)
                }else{
                    next(null, reqs)
                }
                }
            }else{
                next(null, reqs)
            }
        },

        function step3(reqs, next) {
            if(reqs.ccEmail && reqs.ccEmail =="si"){

                Users.find({'type': 'callCenter'},(err, requests4)=>{
                    if (err) {
                        console.error(err);
                        return;
                    }
                    var emails = requests4.map(request => request.email);
                    var textAnalist = emails.join(';');
                    reqs.ccEm = textAnalist
                    next(null, reqs)
                })
            }else{
                next(null, reqs)
            }
        },

        function step4(reqs, next) {
            if(reqs.status && (reqs.status=='Nuevo' || reqs.status=='Asignado' || reqs.status=='Pendiente')){
            async function getEmails(usersArray) {
                const emails = [];
              
                for (let y = 0; y < usersArray.length; y++) {
                  if (usersArray[y] !== null) {
                    const requests = await Users.findById(usersArray[y], {});
                    emails.push(requests.email);
                  }
                }
                return emails.join(';');
              }
              
              async function main() {
                if (reqs.issueMore.emailToSendAnalist && reqs.issueMore.emailToSendAnalist[0] != null) {
                  reqs.textAnalist = await getEmails(reqs.issueMore.emailToSendAnalist);
                }
                if (reqs.issueMore.emailToSendCopy && reqs.issueMore.emailToSendCopy[0] != null) {
                    reqs.textCopy = await getEmails(reqs.issueMore.emailToSendCopy);
                }

                reqs.sendsAnalist= reqs.textAnalist
                reqs.sendsCopy= reqs.textCopy

                if(reqs.ccEm){
                    var email={
                        textAnalist: reqs.reportBy.email+ ';'+reqs.textAnalist+";"+reqs.ccEm,
                        textCopy: reqs.sendsCopy
                    }
                }else{
                    var email={
                        textAnalist: reqs.reportBy.email+ ';'+reqs.textAnalist,
                        textCopy: reqs.sendsCopy
                    }
                }
        
                setTimeout(()=>{
                    next(null, reqs, email)
                }, 3000)
              }
              main();

            }else{
                var email={
                    textAnalist: reqs.reportBy.email+ ';'+reqs.textAnalist,
                    textCopy: reqs.textCopy
                }
                next(null, reqs, email)
            }
            },

            function step5(reqs, email, next) {
            reqs.notes.push({dateOfNote: new Date(),
                noteBy: reqs.reportBy.name,
                typeNote: reqs.typeNote,
                note: reqs.note,
                esperaRespuesta:reqs.esperaRespuesta
                })
                setTimeout(()=>{
                    next(null, reqs, email, email)
                },2000)
        },

        function step6(reqs, email, nop, next) {
            Requests.findByIdAndUpdate(reqs._id,{notes: reqs.notes, esperaRespuesta: reqs.esperaRespuesta, dateLastUpdate: new Date(), afterFiles:reqs.afterFiles},(err, requests3)=>{  
                var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Mensaje de Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b><answerBy> respondió: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr>    <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Este mensaje es autogenerado, si deseas generar una respuesta favor de dirigirte al siguiente enlace: <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:30px;">  <b><CodeRequest2></b> </a> </td>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   </tr>  <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'                
                // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Mensaje de Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://timckets.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b><answerBy> respondió: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr>    <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Este mensaje es autogenerado, si deseas generar una respuesta favor de dirigirte al siguiente enlace: <a href="https://timckets.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:30px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
                // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Mensaje de Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b><answerBy> respondió: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr>    <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Este mensaje es autogenerado, si deseas generar una respuesta favor de dirigirte al siguiente enlace: <a href="http://localhost:4200/requestDetail/<CodeRequest4>" style="font-size:30px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
        
                if(reqs.notes && reqs.notes[0]){
                    HTML = HTML.replace("<answerBy>", reqs.notes[reqs.notes.length-1].noteBy);
                }else{
                    HTML = HTML.replace("<answerBy>", "Bitacora");
                }
                HTML = HTML.replace("<CodeRequest>", reqs.codeRequest);
                HTML = HTML.replace("<CodeRequest2>", reqs.codeRequest);
                HTML = HTML.replace("<CodeRequest3>", reqs.codeRequest);        
                HTML = HTML.replace("<CodeRequest4>", reqs.codeRequest);        
                HTML = HTML.replace("<SubCategory>", reqs.issue.subcategory);
                HTML = HTML.replace("<Service>", reqs.issue.service);
                HTML = HTML.replace("<Description>", reqs.description);
                HTML = HTML.replace("<Note>", reqs.notes[reqs.notes.length-1].note);
                HTML = HTML.replace("<ReportBy>", reqs.sucursalName);
                HTML = HTML.replace("<Direccion>", reqs.reportBy.street + " " + reqs.reportBy.numExt + " " + reqs.reportBy.numInt + " " + reqs.reportBy.suburb + " " + reqs.reportBy.municipality + " " + reqs.reportBy.state);
        
                return transporter.sendMail({
                    from: '...@....',
                    to: email.textAnalist,
                    cc: email.textCopy,
                    subject: '| Alerta de mensajes en Timckets: ' + reqs.codeRequest + ' |', // Subject line
                    html: HTML
                    }, function (error, info) {
                        console.log(email.textAnalist,email.textCopy)
                            res.status(200).send({users: "enviado"})
                    });
                }).populate('reportBy')

        }

    ], function (err) {
        console.log(err);
    });

}

function getOneRequest(req, res){
    
    Requests.find({codeRequest: req.body.ruta},(err, requests)=>{

        if(requests && requests[0] && requests[0].notes && requests[0].notes.length>0){
            // los que tienen mensajes en bitacora
            var ars =0
            var ffinal = null
            var ahora = null
            var momentDia= null

            requests[0].notes.forEach((elementNote, indiceNote) => {
              if(elementNote.esperaRespuesta && elementNote.esperaRespuesta==true){
                // los que tienen minimo un "en espera de respuesta" 

                if(elementNote.noteBy.indexOf("Call")>=0){                  
                  ffinal =moment().tz('America/Monterrey')
                  ahora = moment(new Date()).tz('America/Monterrey').format('HH')
                  momentDia= moment().tz('America/Monterrey').format('DD')

                }else{
                  if(requests[0].notes[indiceNote+1]){
                    // los que tienen mas mensajes

                    var start =moment(elementNote.dateOfNote)
                    var end=moment(requests[0].notes[indiceNote+1].dateOfNote)
                    var minutos = end.diff(start, 'minutes')
                    ars = ars+ minutos
                  }else{
                    // --- este es el ultimo mensaje urgente
                        ffinal =moment(elementNote.dateOfNote).tz('America/Monterrey')
                        ahora = moment(elementNote.dateOfNote).tz('America/Monterrey').format('HH')
                        momentDia= moment(elementNote.dateOfNote).tz('America/Monterrey').format('DD')
            
                  }
                }

              }else{
                // ---- cuando tienen mensajes pero el ultimo es el que no urge
                ffinal =moment().tz('America/Monterrey')
                ahora = moment(new Date()).tz('America/Monterrey').format('HH')
                momentDia= moment().tz('America/Monterrey').format('DD')
              }
            })
          }else{
            // ---- los que no tienen ningun mensaje
            var ffinal =moment().tz('America/Monterrey')
            var ahora = moment(new Date()).tz('America/Monterrey').format('HH')
            var ars =0
            var momentDia= moment().tz('America/Monterrey').format('DD')
          }

          if(requests && requests[0]){
            var fechaFinal = moment(requests[0].dateOfReport).add(ars, 'minutes');
          }

        if(requests[0]){
            requests[0].dateOfReport1= moment(requests[0].dateOfReport)
            requests[0].dateOfReport= fechaFinal

            if(requests[0].dateAssignmentCallCenter && requests[0].dateAssignmentCallCenter != null){
                var fechaFinalCall = moment(requests[0].dateAssignmentCallCenter).add(ars, 'minutes');
              requests[0].dateOfReport = fechaFinalCall
              requests[0].dateOfReport= fechaFinalCall
            }

            var totalHorasRestadas=0
            var totalMinRestadas =0

        var finicial =moment(requests[0].dateOfReport).tz('America/Monterrey')
        var minutos = ffinal.diff(finicial, 'minutes')
        var arr= (minutos/60).toString().split(".")

        var ar = parseInt(arr[0])
        var astring =(ar/24).toString()
        var totalDias = parseInt(astring,10)
    
        var puraHora= moment(requests[0].dateOfReport).tz('America/Monterrey').format('HH')
        var horario1= moment('2023-04-26T14:00:00.000+00:00').tz('America/Monterrey').format('HH')
        var horario2= moment('2023-04-27T01:00:00.000+00:00').tz('America/Monterrey').format('HH')
        var horario2Sabado= moment('2023-04-26T19:00:00.000+00:00').tz('America/Monterrey').format('HH')
    
        var nombreInicio =moment(requests[0].dateOfReport).tz('America/Monterrey').format('YYYY/MM/DD')
        var nomFinal =moment(ffinal).tz('America/Monterrey').format('YYYY/MM/DD')

    var arrDias = []
        var arrDiasNumero = []
    var totalHorasRestadasFinSemana=0
    for (var i = 1; nombreInicio <= nomFinal; i++) {
        arrDias.push((moment(requests[0].dateOfReport).tz('America/Monterrey').add(i-1, 'day').format('ddd')))
        arrDiasNumero.push((moment(requests[0].dateOfReport).tz('America/Monterrey').add(i-1, 'day').format('YYYY/MM/DD')))
        nombreInicio =moment(requests[0].dateOfReport).tz('America/Monterrey').add(i, 'day').format('YYYY/MM/DD')
   }

    arrDias.forEach((elementDia, indiceDia) => {
    if(elementDia=='Sun'){
        // cuando es domingo
        if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
            // cuando el domingo no se aperturó y no es hoy
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
        } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
            // cuando el domingo no se aperturó y es hoy domingo
            if(ahora >= horario1 && ahora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
            }
        }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
            // cuando se levanto el domingo pero hoy no es domingo
            if(puraHora >= horario1 && puraHora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
            }else if(puraHora <= horario1){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
            }
        }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
            // cuando se levanto el domingo y hoy es domingo
            if(ahora >= horario1 && ahora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
            }
        }
    }
    if(elementDia=='Sat'){
        // cuando es sabado
        if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
            // cuando el sabado no se aperturó y no es hoy
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 6
        } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
            // cuando el sabado no se aperturó y es hoy sabado
            if(ahora >= horario1 && ahora<=horario2){
                if(ahora >=horario2Sabado){
                    totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((ahora-horario2Sabado)-1)
                }
            }
        }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
            // cuando se levanto el sabado pero hoy no es sabado
            if(puraHora >= horario1 && puraHora<=horario2){
                if(puraHora >=horario2Sabado){
                    totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((horario2-puraHora)+2)
                }
            }else if(puraHora <= horario1){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 6
            }
        }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
            // cuando se levanto el sabado y hoy es sabado
            if(ahora >= horario1 && ahora<=horario2){
                if(ahora >=horario2Sabado){
                    totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((ahora-horario2Sabado)-1)
                }
            }
        }
    }

    if(arrDiasNumero[indiceDia]=='2023/11/20'){
            // cuando es 20
            if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
                // cuando el 20 no se aperturó y no es hoy
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
            } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
                // cuando el 20 no se aperturó y es hoy 20
                if(ahora >= horario1 && ahora<=horario2){
                    totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
                }
            }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
                // cuando se levanto el 20 pero hoy no es 20
                if(puraHora >= horario1 && puraHora<=horario2){
                    totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
                }else if(puraHora <= horario1){
                    totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
                }
            }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
                // cuando se levanto el 20 y hoy es 20
                if(ahora >= horario1 && ahora<=horario2){
                    totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
                }
            }
    }
    if(arrDiasNumero[indiceDia]=='2023/12/25'){
        // cuando es 20
        if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
            // cuando el 20 no se aperturó y no es hoy
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
        } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
            // cuando el 20 no se aperturó y es hoy 20
            if(ahora >= horario1 && ahora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
            }
        }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
            // cuando se levanto el 20 pero hoy no es 20
            if(puraHora >= horario1 && puraHora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
            }else if(puraHora <= horario1){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
            }
        }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
            // cuando se levanto el 20 y hoy es 20
            if(ahora >= horario1 && ahora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
            }
        }
}

    })

        if(totalDias>=1){
            // todos los que son mayores a dos dias
            totalDias=totalDias
            for(var i=0; i<totalDias; i++ ){
                totalHorasRestadas=totalHorasRestadas+12
            }
            if(totalHorasRestadas==12 && ar<48 ){                  
                if(puraHora>=horario1 && puraHora<=horario2){ // dentro del horario
                    totalHorasTrabajadas= (ar- (6*(ar/12)))
                }else{
                  if(puraHora<horario1){
                    if(moment(requests[0].dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                      totalHorasTrabajadas= (parseInt(ahora) - parseInt(horario1))
                    }else{
                      totalHorasTrabajadas= totalHorasRestadas+ (parseInt(ahora) - parseInt(horario1))                        }
                  }else{
                    if(puraHora>horario2){
                        if(ahora<"08"){
                            totalHorasTrabajadas= totalHorasRestadas
                        }else{
                            if(moment(requests[0].dateOfReport).tz('America/Monterrey').format('DD') ==((momentDia) -1)){
                                totalHorasTrabajadas= totalHorasRestadas
                            }else{
                                totalHorasTrabajadas= totalHorasRestadas + (parseInt(ahora) - parseInt(horario1))
                            }
                        }
                    }
                  }
                  
                }

            }else{
              var cosaRara = (((ar/totalHorasRestadas).toFixed(2)).toString()).split(".")

              if(puraHora<horario1){  // todos los que son menores a las 8am
                totalHorasRestadas= totalHorasRestadas + ((parseInt(horario1)-parseInt(puraHora)))
              }else{
                if(puraHora>horario2){  // todos los que son mayores a las 8am
                  var newss= parseFloat(0+"."+cosaRara[1])
                  totalHorasRestadas= (totalHorasRestadas) + (parseInt(ahora)-parseInt(horario1))
                }
              }

              if(puraHora>=horario1 && puraHora<=horario2){
                if(puraHora>ahora){
                  totalHorasRestadas=totalHorasRestadas+ ((parseInt(horario2)-parseInt(puraHora)) +  parseInt(ahora)-parseInt(horario1))
                }
              }
              // totalHorasRestadas=totalHorasRestadas + ((parseInt(horario2) -parseInt(puraHora))) - (parseInt(ahora)-parseInt(horario1))
            }
            
        }else{ // aqui entran los que tienen menos de 24 horas
            if(puraHora>= horario1 && puraHora<=horario2){
              if(moment(requests[0].dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                if((parseInt(ahora)) >= ((parseInt(horario2))+1)){
                    totalHorasRestadas = (parseInt(ahora)) - ((parseInt(horario2))+1)
                }
              }else{
                if(moment(requests[0].dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                    var totalHorasTrabajadas= ((parseInt(horario2) -parseInt(puraHora)))
                }else{
                    var totalHorasTrabajadas= ((parseInt(ahora)-parseInt(horario1))+ (parseInt(horario2) -parseInt(puraHora)))
                }
              }
              // son los que se subieron dentro de las hoeas
            }else{
                // fuera de hora
    
                if(puraHora <horario1){
                    totalHorasRestadas= parseInt(horario1)-parseInt(puraHora)
                }else{
                    if(moment(requests[0].dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                        totalHorasRestadas = ((parseInt(moment('2023-04-26T04:00:00.000+00:00').tz('America/Monterrey').format('HH')))-(parseInt(puraHora)-(parseInt(moment('2023-04-26T06:00:00.000+00:00').tz('America/Monterrey').format('HH')))))
                        totalHorasRestadas= totalHorasRestadas+8
                    }else{
                        totalHorasRestadas = ((parseInt(moment('2023-04-26T05:00:00.000+00:00').tz('America/Monterrey').format('HH')))-(parseInt(puraHora)-1))
                        totalHorasRestadas= totalHorasRestadas+8
                    }
                }
    
            }
        }

        if(totalHorasTrabajadas){
          totalMinRestadas= totalHorasTrabajadas*60
          var newMinutos= totalMinRestadas
        }else{
          totalMinRestadas= totalHorasRestadas*60
          var newMinutos= minutos-totalMinRestadas
        }
        if(totalHorasRestadasFinSemana > 0){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana*60
            newMinutos = newMinutos-totalHorasRestadasFinSemana
        }

        var arr= (newMinutos/60).toString().split(".")
        var ar = parseInt(arr[0])
        var astring =(ar/24).toString()
        var totalDias = parseInt(astring,10)



        var sums= 0
        for (var i = 0; i < parseInt(arr[0]); i++) {
            var sums=sums+ 60
        };

        var nuevaHora= ar - (totalDias*24)

        if(ar<0){
            ar=0
            totalDias=0
            nuevaHora=0
            newMinutos=0
            sums=0
        }   
        if(newMinutos-sums<0){
            newMinutos=0
            sums=0
        }

        requests[0].tiempos = totalDias+' d ' + nuevaHora + ' h ' + (newMinutos-sums).toString() + ' m'

        if(requests[0].dateSolution){
            var finicial2 =moment(requests[0].dateSolution).tz('America/Monterrey')
        }else{
            var finicial2 =moment(requests[0].dateSolutionCallCenter).tz('America/Monterrey')
        }
        var ffinal2 =moment().tz('America/Monterrey')
        var minutos2 = ffinal2.diff(finicial2, 'minutes')
        var arr2= (minutos2/60).toString().split(".")
        var sums2= 0
        for (var i = 0; i < parseInt(arr2[0]); i++) {
            var sums2=sums2+ 60
        };
        var ar2 = parseInt(arr2[0])
        var astring2 =(ar2/24).toString()
        var dias2 = parseInt(astring2,10)
        var nuevaHora2= ar2 - (dias2*24)

        if(dias2 < 1){
            requests[0].toDateNow="si"
        }else{
            requests[0].toDateNow="no"
        }

        if(dias2 < 3){
            requests[0].toencuesta="si"
        }else{
            requests[0].toencuesta="no"
        }

        res.status(200).send(requests)
    } else{
        res.status(200).send(requests)
    }
    }).populate('issue').populate('analyst').populate('solutionBy').populate({path:'issue', populate:{path: 'emailToSendAnalist'}}).populate({path: 'reportBy', populate:{path: 'area'}})
}

function asign(req, res){

Requests.findByIdAndUpdate(req.body._id,{status: "Asignado", analyst: req.body.analyst,dateLastUpdate: new Date(), dateAssignment: new Date()},(err, requests)=>{
    res.status(200).send(requests)
})
}

function asignCallCenter(req, res){

    async.waterfall([
        function step1(next) {

    req.body.status = "Nuevo"
    req.body.statusCallCenter = "AsignadoCallCenter"
    req.body.issue= mongoose.Types.ObjectId(req.body.issue)
    req.body.issueMore.departments= mongoose.Types.ObjectId(req.body.issueMore.departments)
    req.body.issueMore._id= mongoose.Types.ObjectId(req.body.issueMore._id)

    if(req.body.issueMore.zonesToAnalyst && req.body.issueMore.zonesToAnalyst.porEstado == true){
        if(req.body.reportBy && req.body.reportBy.state){
            if(req.body.reportBy.state =="NuevoLeón"){
                req.body.issueMore.emailToSendAnalist = req.body.issueMore.zonesNL.zonesNLAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                req.body.issueMore.emailToSendCopy = req.body.issueMore.zonesNL.zonesNLCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                req.body.issueMore.zonesNL.zonesNLAnalyst= req.body.issueMore.emailToSendAnalist
                req.body.issueMore.zonesNL.zonesNLCopiados= req.body.issueMore.emailToSendCopy
                next(null, req.body)
            }

            if(req.body.reportBy.state =="Coahuila"){
                req.body.issueMore.emailToSendAnalist = req.body.issueMore.zonesCoahila.zonesCoahilaAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                req.body.issueMore.emailToSendCopy = req.body.issueMore.zonesCoahila.zonesCoahilaCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                req.body.issueMore.zonesCoahila.zonesCoahilaAnalyst= req.body.issueMore.emailToSendAnalist
                req.body.issueMore.zonesCoahila.zonesCoahilaCopiados= req.body.issueMore.emailToSendCopy
                next(null, req.body)
            }

            if(req.body.reportBy.state =="Querétaro"){
                req.body.issueMore.emailToSendAnalist = req.body.issueMore.zonesQueretaro.zonesQueretaroAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                req.body.issueMore.emailToSendCopy = req.body.issueMore.zonesQueretaro.zonesQueretaroCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                req.body.issueMore.zonesQueretaro.zonesQueretaroAnalyst= req.body.issueMore.emailToSendAnalist
                req.body.issueMore.zonesQueretaro.zonesQueretaroCopiados= req.body.issueMore.emailToSendCopy
                next(null, req.body)
            }

            if(req.body.reportBy.state =="Estado-de-México"){
                req.body.issueMore.emailToSendAnalist = req.body.issueMore.zonesMexico.zonesMexicoAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                req.body.issueMore.emailToSendCopy = req.body.issueMore.zonesMexico.zonesMexicoCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                req.body.issueMore.zonesMexico.zonesMexicoAnalyst= req.body.issueMore.emailToSendAnalist
                req.body.issueMore.zonesMexico.zonesMexicoCopiados= req.body.issueMore.emailToSendCopy
                next(null, req.body)
            }
        }
        
    }else {
        req.body.issueMore.emailToSendAnalist = req.body.issueMore.emailToSendAnalist.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
        req.body.issueMore.emailToSendCopy = req.body.issueMore.emailToSendCopy.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
        req.body.issueMore.emailToSendAnalist= req.body.issueMore.emailToSendAnalist
        req.body.issueMore.emailToSendCopy= req.body.issueMore.emailToSendCopy
        next(null, req.body)
    }

},

function step2(body, next) {
    async function getEmails(usersArray) {
        const emails = [];
      
        for (let y = 0; y < usersArray.length; y++) {
          if (usersArray[y] !== null) {
            const requests = await Users.findById(usersArray[y], {});
            emails.push(requests.email);
          }
        }
        return emails.join(';');
      }
      
      async function main() {
        let textAnalist = "";
        let textCopy = "";
        if (body.issueMore.emailToSendAnalist && body.issueMore.emailToSendAnalist[0] != null) {
          textAnalist = await getEmails(body.issueMore.emailToSendAnalist);
        }
        if (body.issueMore.emailToSendCopy && body.issueMore.emailToSendCopy[0] != null) {
          textCopy = await getEmails(body.issueMore.emailToSendCopy);
        }
        var email={
            textAnalist: textAnalist,
            textCopy: textCopy
        }

        setTimeout(()=>{
            next(null, body, email)
        }, 3000)
      }
      main();

},


function step3(body,email, next) {
        Requests.findByIdAndUpdate(body._id,{status: body.status, statusCallCenter: body.statusCallCenter, changeOriginIssue: body.changeOriginIssue, issue: body.issue, issueMore: body.issueMore, service: body.service, subCategory: body.subCategory, department: body.department, motivoAsignadoCallCenter: body.motivoAsignadoCallCenter, dateLastUpdate: new Date(), dateAssignmentCallCenter:  new Date()},(err, requests)=>{
            res.status(200).send(requests)

            var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
            // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://timckets.timhortonsmx.com/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="http://timckets.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
            // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="http://localhost:4200/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>     <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'

            HTML = HTML.replace("<CodeRequest>", body.codeRequest);
            HTML = HTML.replace("<CodeRequest2>", body.codeRequest);
            HTML = HTML.replace("<CodeRequest3>", body.codeRequest);
            HTML = HTML.replace("<CodeRequest4>", body.codeRequest);
            HTML = HTML.replace("<SubCategory>", body.subCategory);
            HTML = HTML.replace("<Service>", body.service);
            HTML = HTML.replace("<Description>", body.description);
            HTML = HTML.replace("<ReportBy>", body.reportBy.name);
            HTML = HTML.replace("<Direccion>", body.reportBy.street + " " + body.reportBy.numExt + " " + body.reportBy.numInt + " " + body.reportBy.suburb + " " + body.reportBy.municipality + " " + body.reportBy.state);

        return transporter.sendMail({
            from: '...@....',
            to: email.textAnalist,
            cc: email.textCopy,
            subject: 'Nuevo Timcket ' + body.codeRequest +' | '+ body.issueMore.subcategory, // Subject line
            html: HTML
            }, function (error, info) {
            console.log("enviado a: " + email.textAnalist + " y cc: " + email.textCopy)
            })
        })

    }

    ], function (err) {
        console.log(err);
    });
}

function reAsign(req, res){
    Requests.findByIdAndUpdate(req.body._id,{analyst: mongoose.Types.ObjectId(req.body.analyst), dateLastUpdate: new Date()},(err, requests)=>{
        res.status(200).send(requests)
    })
    }

function eventos(req, res){
    const emailEventAnalyst1 =[]
    const emailEventCopy2 =[]
    const reqs = req.body
    async.waterfall([
        function step1(next) {
            for(var i=0; i<reqs.issueMore.emailToSendAnalist.length; i++){
                if(reqs.issueMore.emailToSendAnalist[i] && reqs.issueMore.emailToSendAnalist[i] != null){
                    Users.find({_id: reqs.issueMore.emailToSendAnalist[i]},(err, requests)=>{
                        emailEventAnalyst1.push(requests)
                    })
                }
            }                     
            setTimeout(()=>{
                const emailEventAnalyst1s =emailEventAnalyst1
                next(null, emailEventAnalyst1s)
            },200)
        },

        function step2(emailEventAnalyst1, next) {
            for(var i=0; i<reqs.issueMore.emailToSendCopy.length; i++){
                if(reqs.issueMore.emailToSendCopy[i] && reqs.issueMore.emailToSendCopy[i] != null){
                    Users.find({_id: reqs.issueMore.emailToSendCopy[i]},(err, requests)=>{
                        emailEventCopy2.push(requests)
                    })
                }
            }
            setTimeout(()=>{
                const emailEventCopy2s =emailEventCopy2
                next(null, emailEventAnalyst1, emailEventCopy2s)
            },200)
        },

            function step3(emailEventAnalyst1,emailEventCopy2, next) {
                var toSend = [emailEventAnalyst1, emailEventCopy2]
                res.status(200).send(toSend)
        }

        ], function (err) {
            console.log(err);
        });
}

function statusExtra(req, res){
    Requests.findByIdAndUpdate(req.body._id,{statusExtra: req.body.statusExtra, statusExtraBy: req.body.statusExtraBy, statusExtraDate: new Date(), statusExtraMotivo: req.body.statusExtraMotivo},(err, requests)=>{
        res.status(200).send(requests)
    })
}

function pending(req, res){
    Requests.findByIdAndUpdate(req.body._id,{status: "Pendiente", pending: req.body.pending, dateLastUpdate: new Date(), datePendieng: new Date()},(err, requests)=>{
        res.status(200).send(requests)
    })

}

function issueValid(req, res){
    Issues.findByIdAndUpdate(req.body._id,{validado: true},(err, requests)=>{
        res.status(200).send(requests)
    })
}

function pendingCallCenter(req, res){
    Requests.findByIdAndUpdate(req.body._id,{statusCallCenter: "PendienteCallCenter", pendingCallCenter: req.body.pendingCallCenter, dateLastUpdate: new Date(), datePendiengCallCenter: new Date()},(err, requests)=>{
        res.status(200).send(requests)
    })
}

function solution (req, res){
    const reqs = req.body
    async.waterfall([
        function step1(next) {

            if(reqs.notes && reqs.notes.length>0){
                // los que tienen mensajes en bitacora
                var ars =0
                var ffinal = null
                var ahora = null
                var momentDia= null
    
                reqs.notes.forEach((elementNote, indiceNote) => {
                  if(elementNote.esperaRespuesta && elementNote.esperaRespuesta==true){
                    // los que tienen minimo un "en espera de respuesta" 
    
                    if(elementNote.noteBy.indexOf("Call")>=0){                  
                      ffinal =moment().tz('America/Monterrey')
                      ahora = moment(new Date()).tz('America/Monterrey').format('HH')
                      momentDia= moment().tz('America/Monterrey').format('DD')
    
                    }else{
                      if(reqs.notes[indiceNote+1]){
                        // los que tienen mas mensajes
    
                        var start =moment(elementNote.dateOfNote)
                        var end=moment(reqs.notes[indiceNote+1].dateOfNote)
                        var minutos = end.diff(start, 'minutes')
                        ars = ars+ minutos
                      }else{
                        // --- este es el ultimo mensaje urgente
                            ffinal =moment(elementNote.dateOfNote).tz('America/Monterrey')
                            ahora = moment(elementNote.dateOfNote).tz('America/Monterrey').format('HH')
                            momentDia= moment(elementNote.dateOfNote).tz('America/Monterrey').format('DD')
                
                      }
                    }
    
                  }else{
                    // ---- cuando tienen mensajes pero el ultimo es el que no urge
                    ffinal =moment().tz('America/Monterrey')
                    ahora = moment(new Date()).tz('America/Monterrey').format('HH')
                    momentDia= moment().tz('America/Monterrey').format('DD')
                  }
                })
              }else{
                // ---- los que no tienen ningun mensaje
                var ffinal =moment().tz('America/Monterrey')
                var ahora = moment(new Date()).tz('America/Monterrey').format('HH')
                var ars =0
                var momentDia= moment().tz('America/Monterrey').format('DD')
              }
    
              var fechaFinal = moment(reqs.dateOfReport).add(ars, 'minutes');

            reqs.dateOfReport1= moment(reqs.dateOfReport)
            reqs.dateOfReport= fechaFinal

            if(reqs.dateAssignmentCallCenter && reqs.dateAssignmentCallCenter != null){
                var fechaFinalCall = moment(reqs.dateAssignmentCallCenter).add(ars, 'minutes');
              reqs.dateOfReport = fechaFinalCall
              reqs.dateOfReport= fechaFinalCall
            }
            var totalHorasRestadas=0
            var totalMinRestadas =0
            var finicial =moment(reqs.dateOfReport).tz('America/Monterrey')
            var minutos = ffinal.diff(finicial, 'minutes')
            var arr= (minutos/60).toString().split(".")

            
        var ar = parseInt(arr[0])
        var astring =(ar/24).toString()
        var totalDias = parseInt(astring,10)
    
        var puraHora= moment(reqs.dateOfReport).tz('America/Monterrey').format('HH')
        var horario1= moment('2023-04-26T14:00:00.000+00:00').tz('America/Monterrey').format('HH')
        var horario2= moment('2023-04-27T01:00:00.000+00:00').tz('America/Monterrey').format('HH')
        var horario2Sabado= moment('2023-04-26T19:00:00.000+00:00').tz('America/Monterrey').format('HH')
    
        var nombreInicio =moment(reqs.dateOfReport).tz('America/Monterrey').format('YYYY/MM/DD')
        var nomFinal =moment(ffinal).tz('America/Monterrey').format('YYYY/MM/DD')

    var arrDias = []
    var arrDiasNumero = []
    var totalHorasRestadasFinSemana=0
    for (var i = 1; nombreInicio <= nomFinal; i++) {
        arrDias.push((moment(reqs.dateOfReport).tz('America/Monterrey').add(i-1, 'day').format('ddd')))
        arrDiasNumero.push((moment(reqs.dateOfReport).tz('America/Monterrey').add(i-1, 'day').format('YYYY/MM/DD')))
        nombreInicio =moment(reqs.dateOfReport).tz('America/Monterrey').add(i, 'day').format('YYYY/MM/DD')
   }

    arrDias.forEach((elementDia, indiceDia) => {
    if(elementDia=='Sun'){
        // cuando es domingo
        if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
            // cuando el domingo no se aperturó y no es hoy
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
        } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
            // cuando el domingo no se aperturó y es hoy domingo
            if(ahora >= horario1 && ahora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
            }
        }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
            // cuando se levanto el domingo pero hoy no es domingo
            if(puraHora >= horario1 && puraHora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
            }else if(puraHora <= horario1){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
            }
        }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
            // cuando se levanto el domingo y hoy es domingo
            if(ahora >= horario1 && ahora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
            }
        }
    }
    if(elementDia=='Sat'){
        // cuando es sabado
        if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
            // cuando el sabado no se aperturó y no es hoy
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 6
        } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
            // cuando el sabado no se aperturó y es hoy sabado
            if(ahora >= horario1 && ahora<=horario2){
                if(ahora >=horario2Sabado){
                    totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((ahora-horario2Sabado)-1)
                }
            }
        }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
            // cuando se levanto el sabado pero hoy no es sabado
            if(puraHora >= horario1 && puraHora<=horario2){
                if(puraHora >=horario2Sabado){
                    totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((horario2-puraHora)+2)
                }
            }else if(puraHora <= horario1){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 6
            }
        }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
            // cuando se levanto el sabado y hoy es sabado
            if(ahora >= horario1 && ahora<=horario2){
                if(ahora >=horario2Sabado){
                    totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((ahora-horario2Sabado)-1)
                }
            }
        }
    }

    if(arrDiasNumero[indiceDia]=='2023/11/20'){
        // cuando es 20
        if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
            // cuando el 20 no se aperturó y no es hoy
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
        } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
            // cuando el 20 no se aperturó y es hoy 20
            if(ahora >= horario1 && ahora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
            }
        }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
            // cuando se levanto el 20 pero hoy no es 20
            if(puraHora >= horario1 && puraHora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
            }else if(puraHora <= horario1){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
            }
        }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
            // cuando se levanto el 20 y hoy es 20
            if(ahora >= horario1 && ahora<=horario2){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
            }
        }
}
if(arrDiasNumero[indiceDia]=='2023/12/25'){
    // cuando es 20
    if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
        // cuando el 20 no se aperturó y no es hoy
        totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
    } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
        // cuando el 20 no se aperturó y es hoy 20
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
        // cuando se levanto el 20 pero hoy no es 20
        if(puraHora >= horario1 && puraHora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
        }else if(puraHora <= horario1){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
        }
    }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
        // cuando se levanto el 20 y hoy es 20
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }
}

    })

        if(totalDias>=1){
            // todos los que son mayores a dos dias
            totalDias=totalDias
            for(var i=0; i<totalDias; i++ ){
                totalHorasRestadas=totalHorasRestadas+12
            }
            if(totalHorasRestadas==12 && ar<48 ){                  
                if(puraHora>=horario1 && puraHora<=horario2){ // dentro del horario
                    totalHorasTrabajadas= (ar- (6*(ar/12)))
                }else{
                  if(puraHora<horario1){
                    if(moment(reqs.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                      totalHorasTrabajadas= (parseInt(ahora) - parseInt(horario1))
                    }else{
                      totalHorasTrabajadas= totalHorasRestadas+ (parseInt(ahora) - parseInt(horario1))                        }
                  }else{
                    if(puraHora>horario2){
                        if(ahora<"08"){
                            totalHorasTrabajadas= totalHorasRestadas
                        }else{
                            if(moment(reqs.dateOfReport).tz('America/Monterrey').format('DD') ==((momentDia) -1)){
                                totalHorasTrabajadas= totalHorasRestadas
                            }else{
                                totalHorasTrabajadas= totalHorasRestadas + (parseInt(ahora) - parseInt(horario1))
                            }
                        }
                    }
                  }
                  
                }

            }else{
              var cosaRara = (((ar/totalHorasRestadas).toFixed(2)).toString()).split(".")

              if(puraHora<horario1){  // todos los que son menores a las 8am
                totalHorasRestadas= totalHorasRestadas + ((parseInt(horario1)-parseInt(puraHora)))
              }else{
                if(puraHora>horario2){  // todos los que son mayores a las 8am
                  var newss= parseFloat(0+"."+cosaRara[1])
                  totalHorasRestadas= (totalHorasRestadas) + (parseInt(ahora)-parseInt(horario1))
                }
              }

              if(puraHora>=horario1 && puraHora<=horario2){
                if(puraHora>ahora){
                  totalHorasRestadas=totalHorasRestadas+ ((parseInt(horario2)-parseInt(puraHora)) +  parseInt(ahora)-parseInt(horario1))
                }
              }
              // totalHorasRestadas=totalHorasRestadas + ((parseInt(horario2) -parseInt(puraHora))) - (parseInt(ahora)-parseInt(horario1))
            }
            
        }else{ // aqui entran los que tienen menos de 24 horas
            if(puraHora>= horario1 && puraHora<=horario2){
              if(moment(reqs.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                if((parseInt(ahora)) >= ((parseInt(horario2))+1)){
                    totalHorasRestadas = (parseInt(ahora)) - ((parseInt(horario2))+1)
                }
              }else{
                if(moment(reqs.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                    var totalHorasTrabajadas= ((parseInt(horario2) -parseInt(puraHora)))
                }else{
                    var totalHorasTrabajadas= ((parseInt(ahora)-parseInt(horario1))+ (parseInt(horario2) -parseInt(puraHora)))
                }
              }
              // son los que se subieron dentro de las hoeas
            }else{
                // fuera de hora
    
                if(puraHora <horario1){
                    totalHorasRestadas= parseInt(horario1)-parseInt(puraHora)
                }else{
                    if(moment(reqs.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                        totalHorasRestadas = ((parseInt(moment('2023-04-26T04:00:00.000+00:00').tz('America/Monterrey').format('HH')))-(parseInt(puraHora)-(parseInt(moment('2023-04-26T06:00:00.000+00:00').tz('America/Monterrey').format('HH')))))
                        totalHorasRestadas= totalHorasRestadas+8
                    }else{
                        totalHorasRestadas = ((parseInt(moment('2023-04-26T05:00:00.000+00:00').tz('America/Monterrey').format('HH')))-(parseInt(puraHora)-1))
                        totalHorasRestadas= totalHorasRestadas+8
                    }
                }
    
            }
        }

        if(totalHorasTrabajadas){
          totalMinRestadas= totalHorasTrabajadas*60
          var newMinutos= totalMinRestadas
        }else{
          totalMinRestadas= totalHorasRestadas*60
          var newMinutos= minutos-totalMinRestadas
        }
        if(totalHorasRestadasFinSemana > 0){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana*60
            newMinutos = newMinutos-totalHorasRestadasFinSemana
        }
    
        var arr= (newMinutos/60).toString().split(".")
        var ar = parseInt(arr[0])
        var astring =(ar/24).toString()
        var totalDias = parseInt(astring,10)

            var sums= 0
            for (var i = 0; i < parseInt(arr[0]); i++) {
                var sums=sums+ 60
            };
            var nuevaHora= ar - (totalDias*24)
            reqs.tiempos = totalDias+' d ' + nuevaHora + ' h ' + (newMinutos-sums).toString() + ' m'
        
        var brr = reqs.tiempos.split(' ')

        if(ar<0){
            ar=0
            brr[0]=0
            brr[2]=0
            brr[4]=0
        }    
        if(newMinutos-sums<0){
            brr[4]=0
        }   

        reqs.solutionTime={"day": parseInt(brr[0]),"hours":parseInt(brr[2]),"minutes":parseInt(brr[4])}
        reqs.solutionTimeHours = ar
        
        if(reqs.statusCallCenter && (reqs.statusCallCenter== "NuevoCallCenter" || reqs.statusCallCenter=="PendienteCallCenter" )){
            if(reqs.issueMore.slaCallCenter){
                if(reqs.issueMore.slaCallCenter < reqs.solutionTimeHours){
                    reqs.vencidoCallCenter= "si"
                }
            }else{
                if(reqs.issueMore.sla < reqs.solutionTimeHours){
                    reqs.vencidoCallCenter= "si"
                }
            }

            reqs.query= {
                statusCallCenter: "SolucionadoCallCenter",
                solutionBy: reqs.solutionBy,
                solutionCallCenter: reqs.solution,
                solutionBySucursal: reqs.solutionBySucursal,
                dateLastUpdate: new Date(),
                dateSolutionCallCenter: new Date(),
                solutionTime: reqs.solutionTime,
                solutionTimeHours:reqs.solutionTimeHours,
                vencidoCallCenter: reqs.vencidoCallCenter,
                encuesta:''
            }

        }else{

            if(reqs.issueMore.sla < reqs.solutionTimeHours){
                reqs.vencidoH= "si"
            }
            reqs.query= {
                status: "Solucionado",
                solutionBy: reqs.solutionBy,
                solutionTime: reqs.solutionTime,
                dateSolution: new Date(),
                solution: reqs.solution,
                solutionBySucursal:reqs.solutionBySucursal,
                solutionTimeHours: reqs.solutionTimeHours,
                vencidoH: reqs.vencidoH,
                dateLastUpdate: new Date(),
                encuesta:''
            }

        }

        var emeilSendTo =[]
        emeilSendTo.push(reqs.reportBy._id)
        if(reqs.solutionBySucursal=="si"){
            if(reqs.analyst && reqs.analyst!= undefined){
                emeilSendTo.push(reqs.analyst)
            }else{
                if(reqs.issueMore.emailToSendAnalist && reqs.issueMore.emailToSendAnalist[0]){
                    emeilSendTo.push(reqs.issueMore.emailToSendAnalist[0])
                }
                if(reqs.issueMore.emailToSendAnalist && reqs.issueMore.emailToSendAnalist[1]){
                    emeilSendTo.push(reqs.issueMore.emailToSendAnalist[1])
                }
                if(reqs.issueMore.emailToSendCopy && reqs.issueMore.emailToSendCopy[0]){
                    emeilSendTo.push(reqs.issueMore.emailToSendCopy[0])
                }
            }
        }
        
        var emeilToSend = ""
        for(var i=0; i<emeilSendTo.length; i++){
            Users.findById(emeilSendTo[i],{},(err, requests11)=>{
                emeilToSend = emeilToSend + requests11.email+";"
            })
        }
        setTimeout(()=>{
            reqs.emeilToSends =emeilToSend
            next(null, reqs)
        },600)
        },
        function step2(reqs, next) {
    Requests.findByIdAndUpdate(reqs._id, reqs.query,(err, requests)=>{

        var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Solucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest5>" style="color: #0000FF">  <b>Encuesta de satisfacción</b> </a> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Si se vuelve a presentar el problema el mismo día, pueden reabrir el ticket. </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
        // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Solucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://timckets.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"> <a href="http://timckets.timhortonsmx.com/requestDetail/<CodeRequest5>" style="color: #0000FF">  <b>Encuesta de satisfacción</b> </a> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Si se vuelve a presentar el problema el mismo día, pueden reabrir el ticket. </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
        // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Solucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest5>" style="color: #0000FF">  <b>Encuesta de satisfacción</b> </a> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 10px;">Si se vuelve a presentar el problema el mismo día, pueden reabrir el ticket. </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'

        HTML = HTML.replace("<CodeRequest>", reqs.codeRequest);
        HTML = HTML.replace("<CodeRequest2>", reqs.codeRequest);
        HTML = HTML.replace("<CodeRequest3>", reqs.codeRequest);        
        HTML = HTML.replace("<CodeRequest4>", reqs.codeRequest);        
        HTML = HTML.replace("<CodeRequest5>", reqs.codeRequest);        
        HTML = HTML.replace("<SubCategory>", reqs.issue.subcategory);
        HTML = HTML.replace("<Service>", reqs.issue.service);
        HTML = HTML.replace("<Description>", reqs.description);
        if(reqs.solution){
            HTML = HTML.replace("<Note>", reqs.solution);
        }else{
            HTML = HTML.replace("<Note>", reqs.solutionCallCenter);
        }
        HTML = HTML.replace("<ReportBy>", reqs.reportBy.name);
        HTML = HTML.replace("<Direccion>", reqs.reportBy.street + " " + reqs.reportBy.numExt + " " + reqs.reportBy.numInt + " " + reqs.reportBy.suburb + " " + reqs.reportBy.municipality + " " + reqs.reportBy.state);

        return transporter.sendMail({
            from: '...@....',
            to: reqs.emeilToSends,
            subject: 'Cierre de folio ' + reqs.codeRequest + ' | ' + reqs.issue.subcategory, // Subject line
            html: HTML
            }, function (error, info) {
                    res.status(200).send({users: "enviado"})
            });
        })
        }
    ], function (err) {
        console.log(err);
    });

}

function solutionCallCenter (req, res){

    if(req.body.notes && req.body.notes.length>0){
        // los que tienen mensajes en bitacora
        var ars =0
        var ffinal = null
        var ahora = null
        var momentDia= null

        req.body.notes.forEach((elementNote, indiceNote) => {
          if(elementNote.esperaRespuesta && elementNote.esperaRespuesta==true){
            // los que tienen minimo un "en espera de respuesta" 

            if(elementNote.noteBy.indexOf("Call")>=0){                  
              ffinal =moment().tz('America/Monterrey')
              ahora = moment(new Date()).tz('America/Monterrey').format('HH')
              momentDia= moment().tz('America/Monterrey').format('DD')

            }else{
              if(req.body.notes[indiceNote+1]){
                // los que tienen mas mensajes

                var start =moment(elementNote.dateOfNote)
                var end=moment(req.body.notes[indiceNote+1].dateOfNote)
                var minutos = end.diff(start, 'minutes')
                ars = ars+ minutos
              }else{
                // --- este es el ultimo mensaje urgente
                    ffinal =moment(elementNote.dateOfNote).tz('America/Monterrey')
                    ahora = moment(elementNote.dateOfNote).tz('America/Monterrey').format('HH')
                    momentDia= moment(elementNote.dateOfNote).tz('America/Monterrey').format('DD')
        
              }
            }

          }else{
            // ---- cuando tienen mensajes pero el ultimo es el que no urge
            ffinal =moment().tz('America/Monterrey')
            ahora = moment(new Date()).tz('America/Monterrey').format('HH')
            momentDia= moment().tz('America/Monterrey').format('DD')
          }
        })
      }else{
        // ---- los que no tienen ningun mensaje
        var ffinal =moment().tz('America/Monterrey')
        var ahora = moment(new Date()).tz('America/Monterrey').format('HH')
        var ars =0
        var momentDia= moment().tz('America/Monterrey').format('DD')
      }

      var fechaFinal = moment(req.body.dateOfReport).add(ars, 'minutes');

      req.body.dateOfReport= fechaFinal
      
    var totalHorasRestadas=0
    var totalMinRestadas =0
    var finicial =moment(req.body.dateOfReport).tz('America/Monterrey')
    var minutos = ffinal.diff(finicial, 'minutes')
    var arr= (minutos/60).toString().split(".")

              
    var ar = parseInt(arr[0])
    var astring =(ar/24).toString()
    var totalDias = parseInt(astring,10)

    var puraHora= moment(req.body.dateOfReport).tz('America/Monterrey').format('HH')
    var horario1= moment('2023-04-26T14:00:00.000+00:00').tz('America/Monterrey').format('HH')
    var horario2= moment('2023-04-27T01:00:00.000+00:00').tz('America/Monterrey').format('HH')
    var horario2Sabado= moment('2023-04-26T19:00:00.000+00:00').tz('America/Monterrey').format('HH')

    var nombreInicio =moment(req.body.dateOfReport).tz('America/Monterrey').format('YYYY/MM/DD')
    var nomFinal =moment(ffinal).tz('America/Monterrey').format('YYYY/MM/DD')

var arrDias = []
var arrDiasNumero = []
var totalHorasRestadasFinSemana=0
for (var i = 1; nombreInicio <= nomFinal; i++) {
    arrDias.push((moment(req.body.dateOfReport).tz('America/Monterrey').add(i-1, 'day').format('ddd')))
    arrDiasNumero.push((moment(req.body.dateOfReport).tz('America/Monterrey').add(i-1, 'day').format('YYYY/MM/DD')))
    nombreInicio =moment(req.body.dateOfReport).tz('America/Monterrey').add(i, 'day').format('YYYY/MM/DD')
}

arrDias.forEach((elementDia, indiceDia) => {
if(elementDia=='Sun'){
    // cuando es domingo
    if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
        // cuando el domingo no se aperturó y no es hoy
        totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
    } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
        // cuando el domingo no se aperturó y es hoy domingo
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
        // cuando se levanto el domingo pero hoy no es domingo
        if(puraHora >= horario1 && puraHora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
        }else if(puraHora <= horario1){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
        }
    }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
        // cuando se levanto el domingo y hoy es domingo
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }
}
if(elementDia=='Sat'){
    // cuando es sabado
    if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
        // cuando el sabado no se aperturó y no es hoy
        totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 6
    } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
        // cuando el sabado no se aperturó y es hoy sabado
        if(ahora >= horario1 && ahora<=horario2){
            if(ahora >=horario2Sabado){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((ahora-horario2Sabado)-1)
            }
        }
    }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
        // cuando se levanto el sabado pero hoy no es sabado
        if(puraHora >= horario1 && puraHora<=horario2){
            if(puraHora >=horario2Sabado){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((horario2-puraHora)+2)
            }
        }else if(puraHora <= horario1){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 6
        }
    }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
        // cuando se levanto el sabado y hoy es sabado
        if(ahora >= horario1 && ahora<=horario2){
            if(ahora >=horario2Sabado){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((ahora-horario2Sabado)-1)
            }
        }
    }
}

if(arrDiasNumero[indiceDia]=='2023/11/20'){
    // cuando es 20
    if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
        // cuando el 20 no se aperturó y no es hoy
        totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
    } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
        // cuando el 20 no se aperturó y es hoy 20
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
        // cuando se levanto el 20 pero hoy no es 20
        if(puraHora >= horario1 && puraHora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
        }else if(puraHora <= horario1){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
        }
    }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
        // cuando se levanto el 20 y hoy es 20
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }
}
if(arrDiasNumero[indiceDia]=='2023/12/25'){
    // cuando es 20
    if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
        // cuando el 20 no se aperturó y no es hoy
        totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
    } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
        // cuando el 20 no se aperturó y es hoy 20
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
        // cuando se levanto el 20 pero hoy no es 20
        if(puraHora >= horario1 && puraHora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
        }else if(puraHora <= horario1){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
        }
    }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
        // cuando se levanto el 20 y hoy es 20
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }
}

})

    if(totalDias>=1){
        // todos los que son mayores a dos dias
        totalDias=totalDias
        for(var i=0; i<totalDias; i++ ){
            totalHorasRestadas=totalHorasRestadas+12
        }
        if(totalHorasRestadas==12 && ar<48 ){                  
            if(puraHora>=horario1 && puraHora<=horario2){ // dentro del horario
                totalHorasTrabajadas= (ar- (6*(ar/12)))
            }else{
              if(puraHora<horario1){
                if(moment(req.body.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                  totalHorasTrabajadas= (parseInt(ahora) - parseInt(horario1))
                }else{
                  totalHorasTrabajadas= totalHorasRestadas+ (parseInt(ahora) - parseInt(horario1))                        }
              }else{
                if(puraHora>horario2){
                    if(ahora<"08"){
                        totalHorasTrabajadas= totalHorasRestadas
                    }else{
                        if(moment(req.body.dateOfReport).tz('America/Monterrey').format('DD') ==((momentDia) -1)){
                            totalHorasTrabajadas= totalHorasRestadas
                        }else{
                            totalHorasTrabajadas= totalHorasRestadas + (parseInt(ahora) - parseInt(horario1))
                        }
                    }
                }
              }
              
            }

        }else{
          var cosaRara = (((ar/totalHorasRestadas).toFixed(2)).toString()).split(".")

          if(puraHora<horario1){  // todos los que son menores a las 8am
            totalHorasRestadas= totalHorasRestadas + ((parseInt(horario1)-parseInt(puraHora)))
          }else{
            if(puraHora>horario2){  // todos los que son mayores a las 8am
              var newss= parseFloat(0+"."+cosaRara[1])
              totalHorasRestadas= (totalHorasRestadas) + (parseInt(ahora)-parseInt(horario1))
            }
          }

          if(puraHora>=horario1 && puraHora<=horario2){
            if(puraHora>ahora){
              totalHorasRestadas=totalHorasRestadas+ ((parseInt(horario2)-parseInt(puraHora)) +  parseInt(ahora)-parseInt(horario1))
            }
          }
          // totalHorasRestadas=totalHorasRestadas + ((parseInt(horario2) -parseInt(puraHora))) - (parseInt(ahora)-parseInt(horario1))
        }
        
    }else{ // aqui entran los que tienen menos de 24 horas
        if(puraHora>= horario1 && puraHora<=horario2){
          if(moment(req.body.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
            if((parseInt(ahora)) >= ((parseInt(horario2))+1)){
                totalHorasRestadas = (parseInt(ahora)) - ((parseInt(horario2))+1)
            }
          }else{
            if(moment(req.body.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                var totalHorasTrabajadas= ((parseInt(horario2) -parseInt(puraHora)))
            }else{
                var totalHorasTrabajadas= ((parseInt(ahora)-parseInt(horario1))+ (parseInt(horario2) -parseInt(puraHora)))
            }
          }
          // son los que se subieron dentro de las hoeas
        }else{
            // fuera de hora

            if(puraHora <horario1){
                totalHorasRestadas= parseInt(horario1)-parseInt(puraHora)
            }else{
                if(moment(req.body.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                    totalHorasRestadas = ((parseInt(moment('2023-04-26T04:00:00.000+00:00').tz('America/Monterrey').format('HH')))-(parseInt(puraHora)-(parseInt(moment('2023-04-26T06:00:00.000+00:00').tz('America/Monterrey').format('HH')))))
                    totalHorasRestadas= totalHorasRestadas+8
                }else{
                    totalHorasRestadas = ((parseInt(moment('2023-04-26T05:00:00.000+00:00').tz('America/Monterrey').format('HH')))-(parseInt(puraHora)-1))
                    totalHorasRestadas= totalHorasRestadas+8
                }
            }

        }
    }

    if(totalHorasTrabajadas){
      totalMinRestadas= totalHorasTrabajadas*60
      var newMinutos= totalMinRestadas
    }else{
      totalMinRestadas= totalHorasRestadas*60
      var newMinutos= minutos-totalMinRestadas
    }
    if(totalHorasRestadasFinSemana > 0){
        totalHorasRestadasFinSemana= totalHorasRestadasFinSemana*60
        newMinutos = newMinutos-totalHorasRestadasFinSemana
    }

    var arr= (newMinutos/60).toString().split(".")
    var ar = parseInt(arr[0])
    var astring =(ar/24).toString()
    var totalDias = parseInt(astring,10)

    var sums= 0
    for (var i = 0; i < parseInt(arr[0]); i++) {
        var sums=sums+ 60
    };
    var nuevaHora= ar - (totalDias*24)
    req.body.tiempos = totalDias+' d ' + nuevaHora + ' h ' + (newMinutos-sums).toString() + ' m'

var brr = req.body.tiempos.split(' ')

if(ar<0){
    ar=0
    brr[0]=0
    brr[2]=0
    brr[4]=0
}
if(newMinutos-sums<0){
    brr[4]=0
}
req.body.solutionTime={"day": parseInt(brr[0]),"hours":parseInt(brr[2]),"minutes":parseInt(brr[4])}
req.body.solutionTimeHours = ar
if(req.body.issueMore.sla < req.body.solutionTimeHours){
    if(req.body.status){
        req.body.vencidoH= "si"
    }else{
        req.body.vencidoH= null
    }
}
var emeilSendTo =[]

emeilSendTo.push(req.body.reportBy._id)

if(req.body.status && (req.body.status=="Nuevo" ||req.body.status=="Pendiente" ||req.body.status=="Asignado" )){
    if(req.body.issueMore.sla <= req.body.solutionTimeHours){
        req.body.vencidoH= "si"
    }
}else{
    if(req.body.issueMore.slaCallCenter){
        if(req.body.issueMore.slaCallCenter < req.body.solutionTimeHours){
            req.body.vencidoCallCenter= "si"
        }
    }else{
        if(req.body.issueMore.sla < req.body.solutionTimeHours){
            req.body.vencidoCallCenter= "si"
        }
    }
}

var emeilToSend =[]
for(var i=0; i<emeilSendTo.length; i++){
    Users.findById(emeilSendTo[i],{},(err, requests11)=>{
        emeilToSend.push(requests11.email)

    Requests.findByIdAndUpdate(req.body._id,{statusCallCenter: "SolucionadoCallCenter", solutionCallCenter: req.body.solutionCallCenter, solutionBySucursal:req.body.solutionBySucursal, dateLastUpdate: new Date(), dateSolutionCallCenter: new Date(), solutionTime: req.body.solutionTime, solutionTimeHours:req.body.solutionTimeHours, vencidoH:req.body.vencidoH, vencidoCallCenter: req.body.vencidoCallCenter, encuesta:'', solutionBy:req.body.solutionBy},(err, requests)=>{

        var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Solucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest5>" style="color: #0000FF">  <b>Encuesta de satisfacción</b> </a> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Si se vuelve a presentar el problema el mismo día, pueden reabrir el ticket. </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
        // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Solucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://timckets.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"> <a href="http://timckets.timhortonsmx.com/requestDetail/<CodeRequest5>" style="color: #0000FF">  <b>Encuesta de satisfacción</b> </a> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Si se vuelve a presentar el problema el mismo día, pueden reabrir el ticket. </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
        // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Solucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest5>" style="color: #0000FF">  <b>Encuesta de satisfacción</b> </a> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 10px;">Si se vuelve a presentar el problema el mismo día, pueden reabrir el ticket. </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'

        HTML = HTML.replace("<CodeRequest>", req.body.codeRequest);
        HTML = HTML.replace("<CodeRequest2>", req.body.codeRequest);
        HTML = HTML.replace("<CodeRequest3>", req.body.codeRequest);        
        HTML = HTML.replace("<CodeRequest4>", req.body.codeRequest);        
        HTML = HTML.replace("<CodeRequest5>", req.body.codeRequest);        
        HTML = HTML.replace("<SubCategory>", req.body.issue.subcategory);
        HTML = HTML.replace("<Service>", req.body.issue.service);
        HTML = HTML.replace("<Description>", req.body.description);
if(req.body.solutionCallCenter){
    HTML = HTML.replace("<Note>", req.body.solutionCallCenter);
}else{
    HTML = HTML.replace("<Note>", req.body.solution);
}
        HTML = HTML.replace("<ReportBy>", req.body.reportBy.name);
        HTML = HTML.replace("<Direccion>", req.body.reportBy.street + " " + req.body.reportBy.numExt + " " + req.body.reportBy.numInt + " " + req.body.reportBy.suburb + " " + req.body.reportBy.municipality + " " + req.body.reportBy.state);

        return transporter.sendMail({
            from: '...@....',
            to: requests11.email + ';',
            subject: 'Cierre de folio ' + req.body.codeRequest + ' | ' + req.body.issue.subcategory, // Subject line
            html: HTML
            }, function (error, info) {
                if(emeilToSend.length >= emeilSendTo.length){
                    res.status(200).send({users: "enviado"})
                }
            });
        })

})
}

}

function solutionPreventivo (req, res){

    if(req.body.notes && req.body.notes.length>0){
        // los que tienen mensajes en bitacora
        var ars =0
        var ffinal = null
        var ahora = null
        var momentDia= null

        req.body.notes.forEach((elementNote, indiceNote) => {
          if(elementNote.esperaRespuesta && elementNote.esperaRespuesta==true){
            // los que tienen minimo un "en espera de respuesta" 

            if(elementNote.noteBy.indexOf("Call")>=0){                  
              ffinal =moment().tz('America/Monterrey')
              ahora = moment(new Date()).tz('America/Monterrey').format('HH')
              momentDia= moment().tz('America/Monterrey').format('DD')

            }else{
              if(req.body.notes[indiceNote+1]){
                // los que tienen mas mensajes

                var start =moment(elementNote.dateOfNote)
                var end=moment(req.body.notes[indiceNote+1].dateOfNote)
                var minutos = end.diff(start, 'minutes')
                ars = ars+ minutos
              }else{
                // --- este es el ultimo mensaje urgente
                    ffinal =moment(elementNote.dateOfNote).tz('America/Monterrey')
                    ahora = moment(elementNote.dateOfNote).tz('America/Monterrey').format('HH')
                    momentDia= moment(elementNote.dateOfNote).tz('America/Monterrey').format('DD')
        
              }
            }

          }else{
            // ---- cuando tienen mensajes pero el ultimo es el que no urge
            ffinal =moment().tz('America/Monterrey')
            ahora = moment(new Date()).tz('America/Monterrey').format('HH')
            momentDia= moment().tz('America/Monterrey').format('DD')
          }
        })
      }else{
        // ---- los que no tienen ningun mensaje
        var ffinal =moment().tz('America/Monterrey')
        var ahora = moment(new Date()).tz('America/Monterrey').format('HH')
        var ars =0
        var momentDia= moment().tz('America/Monterrey').format('DD')
      }

      var fechaFinal = moment(req.body.dateOfReport).add(ars, 'minutes');

    req.body.dateOfReport1= moment(req.body.dateOfReport)
    req.body.dateOfReport= fechaFinal

    if(req.body.dateAssignmentCallCenter && req.body.dateAssignmentCallCenter != null){
        var fechaFinalCall = moment(req.body.dateAssignmentCallCenter).add(ars, 'minutes');
      req.body.dateOfReport = fechaFinalCall
      req.body.dateOfReport= fechaFinalCall
    }
    var totalHorasRestadas=0
    var totalMinRestadas =0
    var finicial =moment(req.body.dateOfReport).tz('America/Monterrey')
    var minutos = ffinal.diff(finicial, 'minutes')
    var arr= (minutos/60).toString().split(".")
            
    var ar = parseInt(arr[0])
    var astring =(ar/24).toString()
    var totalDias = parseInt(astring,10)

    var puraHora= moment(req.body.dateOfReport).tz('America/Monterrey').format('HH')
    var horario1= moment('2023-04-26T14:00:00.000+00:00').tz('America/Monterrey').format('HH')
    var horario2= moment('2023-04-27T01:00:00.000+00:00').tz('America/Monterrey').format('HH')
    var horario2Sabado= moment('2023-04-26T19:00:00.000+00:00').tz('America/Monterrey').format('HH')

    var nombreInicio =moment(req.body.dateOfReport).tz('America/Monterrey').format('YYYY/MM/DD')
    var hoys= moment(req.body.dateOfReport).tz('America/Monterrey').add('1', 'day').format('dddd')
    var nomFinal =moment(ffinal).tz('America/Monterrey').format('YYYY/MM/DD')

var arrDias = []
var arrDiasNumero = []
var totalHorasRestadasFinSemana=0
for (var i = 1; nombreInicio <= nomFinal; i++) {
    arrDias.push((moment(req.body.dateOfReport).tz('America/Monterrey').add(i-1, 'day').format('ddd')))
    arrDiasNumero.push((moment(req.body.dateOfReport).tz('America/Monterrey').add(i-1, 'day').format('YYYY/MM/DD')))
    nombreInicio =moment(req.body.dateOfReport).tz('America/Monterrey').add(i, 'day').format('YYYY/MM/DD')
}

arrDias.forEach((elementDia, indiceDia) => {
if(elementDia=='Sun'){
    // cuando es domingo
    if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
        // cuando el domingo no se aperturó y no es hoy
        totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
    } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
        // cuando el domingo no se aperturó y es hoy domingo
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
        // cuando se levanto el domingo pero hoy no es domingo
        if(puraHora >= horario1 && puraHora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
        }else if(puraHora <= horario1){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
        }
    }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
        // cuando se levanto el domingo y hoy es domingo
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }
}
if(elementDia=='Sat'){
    // cuando es sabado
    if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
        // cuando el sabado no se aperturó y no es hoy
        totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 6
    } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
        // cuando el sabado no se aperturó y es hoy sabado
        if(ahora >= horario1 && ahora<=horario2){
            if(ahora >=horario2Sabado){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((ahora-horario2Sabado)-1)
            }
        }
    }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
        // cuando se levanto el sabado pero hoy no es sabado
        if(puraHora >= horario1 && puraHora<=horario2){
            if(puraHora >=horario2Sabado){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((horario2-puraHora)+2)
            }
        }else if(puraHora <= horario1){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 6
        }
    }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
        // cuando se levanto el sabado y hoy es sabado
        if(ahora >= horario1 && ahora<=horario2){
            if(ahora >=horario2Sabado){
                totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ ((ahora-horario2Sabado)-1)
            }
        }
    }
}

if(arrDiasNumero[indiceDia]=='2023/11/20'){
    // cuando es 20
    if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
        // cuando el 20 no se aperturó y no es hoy
        totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
    } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
        // cuando el 20 no se aperturó y es hoy 20
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
        // cuando se levanto el 20 pero hoy no es 20
        if(puraHora >= horario1 && puraHora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
        }else if(puraHora <= horario1){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
        }
    }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
        // cuando se levanto el 20 y hoy es 20
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }
}
if(arrDiasNumero[indiceDia]=='2023/12/25'){
    // cuando es 20
    if( indiceDia!=0 && indiceDia!= (arrDias.length-1)){
        // cuando el 20 no se aperturó y no es hoy
        totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
    } else if(indiceDia!=0 && indiceDia== (arrDias.length-1)){
        // cuando el 20 no se aperturó y es hoy 20
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }else if(indiceDia == 0 && indiceDia!= (arrDias.length-1)){
        // cuando se levanto el 20 pero hoy no es 20
        if(puraHora >= horario1 && puraHora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (horario2-puraHora)
        }else if(puraHora <= horario1){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana + 12 
        }
    }else if(indiceDia == 0 && indiceDia== (arrDias.length-1)){
        // cuando se levanto el 20 y hoy es 20
        if(ahora >= horario1 && ahora<=horario2){
            totalHorasRestadasFinSemana= totalHorasRestadasFinSemana+ (ahora-horario1)
        }
    }
}

})

    if(totalDias>=1){
        // todos los que son mayores a dos dias
        totalDias=totalDias
        for(var i=0; i<totalDias; i++ ){
            totalHorasRestadas=totalHorasRestadas+12
        }
        if(totalHorasRestadas==12 && ar<48 ){                  
            if(puraHora>=horario1 && puraHora<=horario2){ // dentro del horario
                totalHorasTrabajadas= (ar- (6*(ar/12)))
            }else{
              if(puraHora<horario1){
                if(moment(req.body.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                  totalHorasTrabajadas= (parseInt(ahora) - parseInt(horario1))
                }else{
                  totalHorasTrabajadas= totalHorasRestadas+ (parseInt(ahora) - parseInt(horario1))                        }
              }else{
                if(puraHora>horario2){
                    if(ahora<"08"){
                        totalHorasTrabajadas= totalHorasRestadas
                    }else{
                        if(moment(req.body.dateOfReport).tz('America/Monterrey').format('DD') ==((momentDia) -1)){
                            totalHorasTrabajadas= totalHorasRestadas
                        }else{
                            totalHorasTrabajadas= totalHorasRestadas + (parseInt(ahora) - parseInt(horario1))
                        }
                    }
                }
              }
              
            }

        }else{
          var cosaRara = (((ar/totalHorasRestadas).toFixed(2)).toString()).split(".")

          if(puraHora<horario1){  // todos los que son menores a las 8am
            totalHorasRestadas= totalHorasRestadas + ((parseInt(horario1)-parseInt(puraHora)))
          }else{
            if(puraHora>horario2){  // todos los que son mayores a las 8am
              var newss= parseFloat(0+"."+cosaRara[1])
              totalHorasRestadas= (totalHorasRestadas) + (parseInt(ahora)-parseInt(horario1))
            }
          }

          if(puraHora>=horario1 && puraHora<=horario2){
            if(puraHora>ahora){
              totalHorasRestadas=totalHorasRestadas+ ((parseInt(horario2)-parseInt(puraHora)) +  parseInt(ahora)-parseInt(horario1))
            }
          }
          // totalHorasRestadas=totalHorasRestadas + ((parseInt(horario2) -parseInt(puraHora))) - (parseInt(ahora)-parseInt(horario1))
        }
        
    }else{ // aqui entran los que tienen menos de 24 horas
        if(puraHora>= horario1 && puraHora<=horario2){
          if(moment(req.body.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
            if((parseInt(ahora)) >= ((parseInt(horario2))+1)){
                totalHorasRestadas = (parseInt(ahora)) - ((parseInt(horario2))+1)
            }
          }else{
            if(moment(req.body.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                var totalHorasTrabajadas= ((parseInt(horario2) -parseInt(puraHora)))
            }else{
                var totalHorasTrabajadas= ((parseInt(ahora)-parseInt(horario1))+ (parseInt(horario2) -parseInt(puraHora)))
            }
          }
          // son los que se subieron dentro de las hoeas
        }else{
            // fuera de hora

            if(puraHora <horario1){
                totalHorasRestadas= parseInt(horario1)-parseInt(puraHora)
            }else{
                if(moment(req.body.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                    totalHorasRestadas = ((parseInt(moment('2023-04-26T04:00:00.000+00:00').tz('America/Monterrey').format('HH')))-(parseInt(puraHora)-(parseInt(moment('2023-04-26T06:00:00.000+00:00').tz('America/Monterrey').format('HH')))))
                    totalHorasRestadas= totalHorasRestadas+8
                }else{
                    totalHorasRestadas = ((parseInt(moment('2023-04-26T05:00:00.000+00:00').tz('America/Monterrey').format('HH')))-(parseInt(puraHora)-1))
                    totalHorasRestadas= totalHorasRestadas+8
                }
            }

        }
    }

    if(totalHorasTrabajadas){
      totalMinRestadas= totalHorasTrabajadas*60
      var newMinutos= totalMinRestadas
    }else{
      totalMinRestadas= totalHorasRestadas*60
      var newMinutos= minutos-totalMinRestadas
    }
    if(totalHorasRestadasFinSemana > 0){
        totalHorasRestadasFinSemana= totalHorasRestadasFinSemana*60
        newMinutos = newMinutos-totalHorasRestadasFinSemana
    }

    var arr= (newMinutos/60).toString().split(".")
    var ar = parseInt(arr[0])
    var astring =(ar/24).toString()
    var totalDias = parseInt(astring,10)

    var sums= 0
    for (var i = 0; i < parseInt(arr[0]); i++) {
        var sums=sums+ 60
    };
    var nuevaHora= ar - (totalDias*24)
    req.body.tiempos = totalDias+' d ' + nuevaHora + ' h ' + (newMinutos-sums).toString() + ' m'

var brr = req.body.tiempos.split(' ')
if(ar<0){
    ar=0
    brr[0]=0
    brr[2]=0
    brr[4]=0
}    
if(newMinutos-sums<0){
    brr[4]=0
}
req.body.solutionTime={"day": parseInt(brr[0]),"hours":parseInt(brr[2]),"minutes":parseInt(brr[4])}
req.body.solutionTimeHours = ar
if(req.body.issueMore.sla <= req.body.solutionTimeHours){
    if(req.body.status){
        req.body.vencidoH= "si"
    }
}
var emeilSendTo =[]

emeilSendTo.push(req.body.reportBy._id)

if(req.body.status && (req.body.status=="Nuevo" ||req.body.status=="Pendiente" ||req.body.status=="Asignado" )){
    if(req.body.issueMore.sla <= req.body.solutionTimeHours){
        req.body.vencidoH= "si"
    }
    var solution = {status: "SolucionadoPreventivo", solution: req.body.solution, solutionBy: req.body.solutionBy, solutionBySucursal:req.body.solutionBySucursal, dateLastUpdate: new Date(), dateSolution: new Date(), solutionTime: req.body.solutionTime, solutionTimeHours:req.body.solutionTimeHours, vencidoH:req.body.vencidoH, encuesta:''}
}else{
    if(req.body.issueMore.slaCallCenter){
        if(req.body.issueMore.slaCallCenter < req.body.solutionTimeHours){
            req.body.vencidoCallCenter= "si"
        }
    }else{
        if(req.body.issueMore.sla < req.body.solutionTimeHours){
            req.body.vencidoCallCenter= "si"
        }
    }
    var solution = {statusCallCenter: "SolucionadoCallCenterPreventivo", solutionBy: req.body.solutionBy, solutionCallCenter: req.body.solutionCallCenter, solutionBySucursal:req.body.solutionBySucursal, dateLastUpdate: new Date(), dateSolutionCallCenter: new Date(), solutionTime: req.body.solutionTime, solutionTimeHours:req.body.solutionTimeHours, vencidoCallCenter:req.body.vencidoCallCenter, encuesta:''}    
}

var emeilToSend =[]
for(var i=0; i<emeilSendTo.length; i++){
    Users.findById(emeilSendTo[i],{},(err, requests11)=>{
        emeilToSend.push(requests11.email)

    Requests.findByIdAndUpdate(req.body._id, solution ,(err, requests)=>{

        var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Solucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Link para poder ver fecha de preventivo: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;">https://calendar.google.com/calendar/u/0?cid=Y183NzA0MDE4MGYzZmNjMjk0NmU2ZDM1MGY0ZmMxZThhNWQ5OWY4MDIyMjZhYzRlNDk0ZTQ4Y2ViN2VmMjRlNDk5QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20</td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest5>" style="color: #0000FF">  <b>Encuesta de satisfacción</b> </a> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Si se vuelve a presentar el problema el mismo día, pueden reabrir el ticket. </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
        // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Solucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://timckets.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Link para poder ver fecha de preventivo: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;">https://calendar.google.com/calendar/u/0?cid=Y183NzA0MDE4MGYzZmNjMjk0NmU2ZDM1MGY0ZmMxZThhNWQ5OWY4MDIyMjZhYzRlNDk0ZTQ4Y2ViN2VmMjRlNDk5QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20</td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"> <a href="http://timckets.timhortonsmx.com/requestDetail/<CodeRequest5>" style="color: #0000FF">  <b>Encuesta de satisfacción</b> </a> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Si se vuelve a presentar el problema el mismo día, pueden reabrir el ticket. </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
        // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Solucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Link para poder ver fecha de preventivo: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;">https://calendar.google.com/calendar/u/0?cid=Y183NzA0MDE4MGYzZmNjMjk0NmU2ZDM1MGY0ZmMxZThhNWQ5OWY4MDIyMjZhYzRlNDk0ZTQ4Y2ViN2VmMjRlNDk5QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20</td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest5>" style="color: #0000FF">  <b>Encuesta de satisfacción</b> </a> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 10px;">Si se vuelve a presentar el problema el mismo día, pueden reabrir el ticket. </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'

        HTML = HTML.replace("<CodeRequest>", req.body.codeRequest);
        HTML = HTML.replace("<CodeRequest2>", req.body.codeRequest);
        HTML = HTML.replace("<CodeRequest3>", req.body.codeRequest);        
        HTML = HTML.replace("<CodeRequest4>", req.body.codeRequest);        
        HTML = HTML.replace("<CodeRequest5>", req.body.codeRequest);        
        HTML = HTML.replace("<SubCategory>", req.body.issue.subcategory);
        HTML = HTML.replace("<Service>", req.body.issue.service);
        HTML = HTML.replace("<Description>", req.body.description);
        HTML = HTML.replace("<Note>", "Favor de agregar a la lista de pendientes para el preventivo.");
        HTML = HTML.replace("<ReportBy>", req.body.reportBy.name);
        HTML = HTML.replace("<Direccion>", req.body.reportBy.street + " " + req.body.reportBy.numExt + " " + req.body.reportBy.numInt + " " + req.body.reportBy.suburb + " " + req.body.reportBy.municipality + " " + req.body.reportBy.state);

        return transporter.sendMail({
            from: '...@....',
            to: requests11.email + ';',
            subject: 'Cierre de folio ' + req.body.codeRequest + ' | ' + req.body.issue.subcategory, // Subject line
            html: HTML
            }, function (error, info) {
                if(emeilToSend.length >= emeilSendTo.length){
                    console.log(requests11.email)
                    res.status(200).send({users: "enviado"})
                }
            });
        })

})
}
}

function newService (req, res){
    req.body.active = true
    var issues = new Issues(req.body);
    issues.save((err, userStored)=>{
        if(err){
            res.status(500).send({message: 'Error al guardar la sucursal'})
        } else{
            if(!userStored){
                res.status(404).send({message: 'No se pudo registrar el servicio'})
            } else{
                res.status(200).send({users: userStored})
            }
        }
    });


}

function editService (req, res){
Issues.findByIdAndUpdate(req.body._id,{emailToSendAnalist:req.body.emailToSendAnalist, emailToSendCopy:req.body.emailToSendCopy, departments: req.body.departments, category: req.body.category, service: req.body.service, descService: req.body.descService, subcategory: req.body.subcategory, descSubcategory: req.body.descSubcategory, sla: req.body.sla, slaCallCenter: req.body.slaCallCenter, descSla: req.body.descSla, format: req.body.format, active: req.body.active, campo: req.body.campo, zonesToAnalyst: req.body.zonesToAnalyst, zonesNL: req.body.zonesNL, zonesCoahila: req.body.zonesCoahila, zonesQueretaro: req.body.zonesQueretaro, zonesMexico: req.body.zonesMexico, critico: req.body.critico, chatbot: req.body.chatbot },(err, requests)=>{
    res.status(200).send(requests)
})
}

function searchService (req, res){
    Issues.find({departments: req.body.service},(err, requests)=>{
        const unicos = [];
        if(requests){
        requests.forEach( (elemento) => {
            if (!unicos.includes(elemento.service)) {
                unicos.push(elemento.service);
                unicos.push({"service": elemento.service, "descService": elemento.descService, "_id": elemento._id});
            }
          });
        }
        res.status(200).send(unicos)
    })
}

function searchSubCategoria (req, res){
    Issues.find({service: req.body.service},(err, requests)=>{
        const unicos = [];
        if(requests){
        requests.forEach( (elemento) => {
            if (!unicos.includes(elemento.subcategory)) {
                unicos.push(elemento);
            }
          });
        }
        res.status(200).send(unicos)
    })
}


function areaBranches (req, res){

    Areas.find({responsable: mongoose.Types.ObjectId(req.body._id)},(err, requests1)=>{

        Users.find({area: requests1[0]._id},(err, requests2)=>{
            res.status(200).send(requests2)
        })

    })

}

function getOneUser (req, res){

        Users.find({_id: req.body.sucursal},(err, requests2)=>{
            res.status(200).send(requests2)
        })
}

function editPending (req, res){
    Requests.findByIdAndUpdate(req.body._id,{pending: req.body.pending, dateLastUpdate: new Date()},(err, requests)=>{
        res.status(200).send(requests)
    })
}

function editPendingCC (req, res){
    Requests.findByIdAndUpdate(req.body._id,{pendingCallCenter: req.body.pendingCallCenter, dateLastUpdate: new Date()},(err, requests)=>{
        res.status(200).send(requests)
    })
}

function reaperturar (req, res){
    if(!req.body.reaperturado && req.body.reaperturado == null){
        req.body.reaperturado= [{note: req.body.motivoReapertura, by: mongoose.Types.ObjectId(req.body._id),date: new Date()}]
    }else{
        req.body.reaperturado.push({note: req.body.motivoReapertura, by: mongoose.Types.ObjectId(req.body._id), date: new Date()})
    }
    if(req.body.pending){
        req.body.status = "Pendiente"
    }else if(req.body.dateAssignment){
        req.body.status = "Asignado"
    }
    
    if(req.body.dateAssignmentCallCenter){
        req.body.status = "Nuevo"
        req.body.statusCallCenter = "AsignadoCallCenter"
    } else if(req.body.pendingCallCenter){
        req.body.statusCallCenter = "PendienteCallCenter"
    } else if(req.body.statusCallCenter){
        req.body.statusCallCenter = "NuevoCallCenter"
    }

    if(req.body.statusCallCenter == "SolucionadoCallCenter"){
        req.body.statusCallCenter = "AsignadoCallCenter"
    }
    if(req.body.statusCallCenter == "AutoSolucionado"){
        req.body.statusCallCenter = "AsignadoCallCenter"
    }
    if(req.body.statusCallCenter == "SolucionadoPreventivoCallCenter"){
        req.body.statusCallCenter = "AsignadoCallCenter"
    }

    var textAnalist = ""
    if(req.body.status){
    if(req.body.issueMore.emailToSendAnalist && req.body.issueMore.emailToSendAnalist[0]!=null){
        for(var y=0; y<req.body.issueMore.emailToSendAnalist.length; y++){
            if(req.body.issueMore.emailToSendAnalist[y] == null){
            }else{
                Users.findById(req.body.issueMore.emailToSendAnalist[y],{},(err, requests1)=>{
                    if(textAnalist == ""){
                        textAnalist = requests1.email+";"
                    }else{
                        textAnalist = textAnalist + (requests1.email+";")
                    }
                })
            }
        }
    } 
}else{
    Users.find({'type': 'callCenter'},(err, requests4)=>{
        if(requests4 && requests4[0]){
            textAnalist=";"
            for(var i=0; i<requests4.length; i++){
                textAnalist = textAnalist + (requests4[i].email+";")
            }
        }

    })
}

if(req.body.status && req.body.statusCallCenter){
    var guardar ={
        reaperturado: req.body.reaperturado, status: req.body.status, statusCallCenter: req.body.statusCallCenter, dateLastUpdate: new Date(), encuesta:''
    }
}else if(req.body.status){
    var guardar ={
        reaperturado: req.body.reaperturado, status: req.body.status, dateLastUpdate: new Date(), encuesta:''
    }
}else{
    var guardar ={
        reaperturado: req.body.reaperturado, statusCallCenter: req.body.statusCallCenter, dateLastUpdate: new Date(), encuesta:''
    }
}

    setTimeout(()=>{
        Requests.findByIdAndUpdate(req.body._id, guardar,(err, requests)=>{
            res.status(200).send(requests)

    var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Reapertura de Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b><answerBy>: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr>    <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Este mensaje es autogenerado, si deseas generar una respuesta favor de dirigirte al siguiente enlace: <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:30px;">  <b><CodeRequest2></b> </a> </td>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   </tr>  <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'                
    // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Reapertura de Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://timckets.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b><answerBy>: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr>    <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Este mensaje es autogenerado, si deseas generar una respuesta favor de dirigirte al siguiente enlace: <a href="http://timckets.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:30px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
    // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Reapertura de Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b><answerBy>: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr>    <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#CB1717; font-size:14px; padding-top: 5px;">Este mensaje es autogenerado, si deseas generar una respuesta favor de dirigirte al siguiente enlace: <a href="http://localhost:4200/requestDetail/<CodeRequest4>" style="font-size:30px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'

    HTML = HTML.replace("<CodeRequest>", req.body.codeRequest);
    HTML = HTML.replace("<CodeRequest2>", req.body.codeRequest);
    HTML = HTML.replace("<CodeRequest3>", req.body.codeRequest);
    HTML = HTML.replace("<CodeRequest4>", req.body.codeRequest);
    HTML = HTML.replace("<ReportBy>", req.body.reportBy.name);
    HTML = HTML.replace("<answerBy>", "Motivo de reapertura");
    HTML = HTML.replace("<Note>", req.body.reaperturado[req.body.reaperturado.length-1].note);
    HTML = HTML.replace("<SubCategory>", req.body.issue.subcategory);
    HTML = HTML.replace("<Service>", req.body.issue.service);
    HTML = HTML.replace("<Direccion>", req.body.reportBy.street + " " + req.body.reportBy.numExt + " " + req.body.reportBy.numInt + " " + req.body.reportBy.suburb + " " + req.body.reportBy.municipality + " " + req.body.reportBy.state);

    return transporter.sendMail({
        from: '...@....',
        to: textAnalist,
        subject: 'Reapertura de Timcket ' + req.body.codeRequest +' | '+ req.body.issueMore.subcategory, // Subject line
        html: HTML
        }, function (error, info) {
        });
    })
    },2000)
}

function encuesta (req, res){
    Requests.findByIdAndUpdate(req.body._id,{encuesta: req.body.encuesta, encuestaComents: req.body.encuestaComents},(err, requests)=>{
        res.status(200).send({users: "enviado"})
    })
}

function getEncuesta (req, res){
    var dia =new Date()-new Date(72 * 3600 * 1000)
    Requests.find(
        {
            reportBy: req.body._id,
            encuesta:'',
            $or:[
                {'status': 'Solucionado'},
                {'status': 'SolucionadoPreventivo'},
                {'status': 'AutoSolucionado'},
                {'statusCallCenter': 'SolucionadoCallCenter'},
                {'statusCallCenter': 'SolucionadoPreventivoCallCenter'},
                {'statusCallCenter': 'AutoSolucionado'},
            ],
            $or:[
                {dateSolution:{$gte: dia}},
                {dateSolutionCallCenter:{$gte: dia}},
            ],
        },
        (err, requests)=>{
        res.status(200).send(requests)
    }).populate('reportBy issue').populate('analyst')
}

function getMessages (req, res){
    var dia =new Date()-new Date(72 * 3600 * 1000)
    Requests.find(
        {
            reportBy: req.body._id,
            $and:[
                {'status': {$ne:'Solucionado'}},
                {'status': {$ne:'SolucionadoPreventivo'}},
                {'status': {$ne:'AutoSolucionado'}},
                {'statusCallCenter': {$ne:'SolucionadoCallCenter'}},
                {'statusCallCenter': {$ne:'SolucionadoPreventivoCallCenter'}},
                {'statusCallCenter': {$ne:'AutoSolucionado'}},
                {'notes.0': {$exists: true}}
            ],
        },
        (err, requests)=>{
            var newReq =[]
            requests.forEach((element1, index1)=>{
                if(element1.notes[element1.notes.length-1].esperaRespuesta==true){
                    newReq.push(element1)
                }
            })
            setTimeout(()=>{
                res.status(200).send(newReq)
            },500)
    }).populate('reportBy issue').populate('analyst')
}

function getMessageAdmin (req, res){
    Requests.find(
        {
            esperaRespuesta: true
        },
        (err, requests)=>{
                res.status(200).send(requests)
            }).populate({path: 'reportBy', populate:{path: 'area'}}).populate({path:'issue', populate:{path: 'emailToSendAnalist'}}).populate('analyst')
        }

function getMessageDepto (req, res){
    Requests.find(
        {
            esperaRespuesta: true,
            department: req.body.department._id,
            $and:[
                {'status': {$ne:'Solucionado'}},
                {'status': {$ne:'SolucionadoPreventivo'}},
                {'status': {$ne:'AutoSolucionado'}},
                {'statusCallCenter': {$ne:'SolucionadoCallCenter'}},
                {'statusCallCenter': {$ne:'SolucionadoPreventivoCallCenter'}},
                {'statusCallCenter': {$ne:'AutoSolucionado'}},
                {'notes.0': {$exists: true}}
            ],
        },
        (err, requests)=>{
                res.status(200).send(requests)
    }).populate({path: 'reportBy', populate:{path: 'area'}}).populate({path:'issue', populate:{path: 'emailToSendAnalist'}}).populate('analyst')
}

function getResponseDepto (req, res){
    if(req.body.department){
    Requests.find(
        {
            department: req.body.department._id,
            $and:[
                {'status': {$ne:'Solucionado'}},
                {'status': {$ne:'SolucionadoPreventivo'}},
                {'status': {$ne:'AutoSolucionado'}},
                {'statusCallCenter': {$ne:'SolucionadoCallCenter'}},
                {'statusCallCenter': {$ne:'SolucionadoPreventivoCallCenter'}},
                {'statusCallCenter': {$ne:'AutoSolucionado'}},
                {'notes.0': {$exists: true}}
            ],
        },
        (err, requests)=>{
            var newReq =[]
            requests.forEach((element1, index1)=>{
                if(element1.notes.length>1){
                    if(element1.notes[element1.notes.length-2].esperaRespuesta==true && element1.notes[element1.notes.length-1].esperaRespuesta!=true){
                         newReq.push(element1)
                    }

                }
            })
            setTimeout(()=>{
                res.status(200).send(newReq)
            },500)    }).populate({path: 'reportBy', populate:{path: 'area'}}).populate({path:'issue', populate:{path: 'emailToSendAnalist'}}).populate('analyst')
        }else{
            res.status(200).send(req.body)
        }
        }

function getInCallCenter (req, res){


    Requests.find({
        $or:[
            {"issueMore.zonesToAnalyst": {$exists: false}},
            {"issueMore.zonesToAnalyst.general": true}
        ],
        $and:[
            {
                $or:[
                    {"issueMore.emailToSendAnalist": mongoose.Types.ObjectId(req.body._id)},
                    {"issueMore.emailToSendCopy": mongoose.Types.ObjectId(req.body._id)}                                
                ]
            },
            {status :{$ne: "Solucionado"}},
            {
                $or:[
                    {
                        'statusCallCenter': "PendienteCallCenter"
                    },
                    {
                        'statusCallCenter': "NuevoCallCenter"
                    }
                ]     
            }
        ]
    },(err, requests1)=>{

Requests.aggregate([
    {
        $match: { "issueMore.zonesToAnalyst.porEstado": true }
    },
    {
        $lookup: {
          from: "users",
          localField: "reportBy",
          foreignField: "_id",
          as: "reportBy"
        }
      },
      {
        $unwind: {
          path: "$reportBy",
          preserveNullAndEmptyArrays: true
        },
      },
      {
        $match: {
        $or:[{
            $and:[

                {
                    "reportBy.state": "NuevoLeón",
            },{
                    "issueMore.zonesNL.zonesNLAnalyst": mongoose.Types.ObjectId(req.body._id)
            },
            {status :{$ne: "Solucionado"}},
            {
                $or:[{'statusCallCenter': "PendienteCallCenter"}, {'statusCallCenter': "NuevoCallCenter"},]
            },
        ],
        },{
            $and:[
                {
                    "reportBy.state": "NuevoLeón",
            },{
                    "issueMore.zonesNL.zonesNLCopiados": mongoose.Types.ObjectId(req.body._id)
            },
            {status :{$ne: "Solucionado"}},
            {
                $or:[{'statusCallCenter': "PendienteCallCenter"}, {'statusCallCenter': "NuevoCallCenter"},]
            },
        ],
        },{
            $and:[
                {
                    "reportBy.state": "Coahuila",
            },{
                    "issueMore.zonesCoahila.zonesCoahilaAnalyst": mongoose.Types.ObjectId(req.body._id)
            },
            {status :{$ne: "Solucionado"}},
            {
                $or:[{'statusCallCenter': "PendienteCallCenter"}, {'statusCallCenter': "NuevoCallCenter"},]
            },
        ],
        },{
            $and:[
                {
                    "reportBy.state": "Coahuila",
            },{
                    "issueMore.zonesCoahila.zonesCoahilaCopiados": mongoose.Types.ObjectId(req.body._id)
            },
            {status :{$ne: "Solucionado"}},
            {
                $or:[{'statusCallCenter': "PendienteCallCenter"}, {'statusCallCenter': "NuevoCallCenter"},]
            },
        ],
        },{
            $and:[
                {
                    "reportBy.state": "Querétaro",
            },{
                    "issueMore.zonesQueretaro.zonesQueretaroAnalyst": mongoose.Types.ObjectId(req.body._id)
            },
            {status :{$ne: "Solucionado"}},
            {
                $or:[{'statusCallCenter': "PendienteCallCenter"}, {'statusCallCenter': "NuevoCallCenter"},]
            },
        ],
        },{
            $and:[
                {
                    "reportBy.state": "Querétaro",
            },{
                    "issueMore.zonesQueretaro.zonesQueretaroCopiados": mongoose.Types.ObjectId(req.body._id)
            },
            {status :{$ne: "Solucionado"}},
            {
                $or:[{'statusCallCenter': "PendienteCallCenter"}, {'statusCallCenter': "NuevoCallCenter"},]
            },
        ],
        }]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "analyst",
          foreignField: "_id",
          as: "analyst"
        }
      },
      {
        $unwind: {
          path: "$analyst",
          preserveNullAndEmptyArrays: true
        },
      },
      {
        $lookup: {
          from: "issues",
          localField: "issue",
          foreignField: "_id",
          as: "issue"
        }
      },
      {
        $unwind: {
          path: "$issue",
          preserveNullAndEmptyArrays: true
        },
      },
]).allowDiskUse(true).exec()
.then(requests2 => {
    var todos =[]
    todos = [...new Set([...requests1, ...requests2])]
    let set = new Set( todos.map( JSON.stringify ) )
    let arrSinDuplicaciones = Array.from( set ).map( JSON.parse );

    res.status(200).send(arrSinDuplicaciones)

})
.catch(err => {
    console.log(err);
    res.json(err).status(500).end();
});
}).populate('issue').populate('analyst').populate({path: 'reportBy', populate:{path: 'area'}})

    
}

function chatGpt (req, res){
    const options = {
        method: 'POST',
        url: 'https://www.chatbase.co/api/v1/chat',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: 'Bearer (llavesToken)'
        },
        data: {
          messages: req.body,
          stream: false,
          temperature: 0,
          model: 'gpt-3.5-turbo',
          chatbotId: 'ID'
        }
      };
      axios
        .request(options)
        .then(function (response) {
          res.status(200).send(response.data)
        })
        .catch(function (error) {
          console.error(error);
        });
        

}

module.exports = {
    chatGpt,
    prueba,
    all,
    allCallCenter,
    allSolucionadosCallCenter,
    allSolucionadosCallCenter2,
    allHistory,
    allHistorySolucionado,
    allHistoryDepartments,
    allHistorySolucionadoDepartments,
    allSolucionados,
    addNote,
    getOneRequest,
    asign,
    asignCallCenter,
    eventos,
    pending,
    pendingCallCenter,
    solution,
    solutionCallCenter,
    enviarCorreoNuevo,
    newService,
    editService,
    searchService,
    searchSubCategoria,
    uploadImage,
    uploadImageAfter,
    getImage,
    areaBranches,
    getOneUser,
    editPending,
    editPendingCC,
    reaperturar,
    reAsign,
    encuesta,
    getEncuesta,
    solutionPreventivo,
    getInCallCenter,
    getMessages,
    getMessageAdmin,
    getMessageDepto,
    getResponseDepto,
    allSolucionadosNum,
    statusExtra,
    issueValid,
}