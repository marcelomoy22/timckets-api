'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt =require('bcrypt-nodejs');
var twt = require('../services/jwt');
var Users = require('../models/users');
var Areas = require('../models/areas')
var SpeedOfService = require('../models/speedOfService')
var Orders = require('../models/orders')
var OrdersDay = require('../models/ordersDay')
var LaborDay = require('../models/laborDay')
var LaborXHours = require('../models/laborXHours')
var mongoose = require('mongoose');
var axios = require('axios');
var async = require('async');
const moment = require('moment-timezone')
var Requests = require('../models/requests');
var mongoose = require('mongoose');
const { DateTime } = require('luxon');

var nodemailer = require('nodemailer');
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

function prueba(req, res){
    Users.find({},(err,user)=>{
        res.status(200).send({user})
    })
}

function laborSetInterval(req, res){
    // setInterval(() => labor(req, res),300000);  // 7min
    // setInterval(() => ordersDay(req, res),480000);   // 9 minutos
    // setInterval(() => autoEscalamiento(req, res),600000); //11 minutos
    // setInterval(() => autoClosed(req, res),3180000);  //56 minutos
}

function tokenXenial(req, res){
    var headers1 = {
        'key_id': '',
        'secret_key': '',
    };
    axios.post('{{URL_Xenial}}/integrator/token', headers1).then(reqToken =>{
        Users.findByIdAndUpdate('62f1aac722e803510baceebd', {xenialToken: 'Bearer '+ reqToken.data}, (err, userUpdated)=>{
            if(err){
                return
            } else{
                res.status(200).send({message: "token guardado"})
                return
            }
        })
    }).catch(err => {
        console.log("err en speedOfService step2 ")
    })
}


function getAccessToken(req, res){
    const data = ''; // Aqui va mis contraseñas

    axios.post('https://login.microsoftonline.com/{{otraData}}/oauth2/token', data, {
        headers:{
            // mis headers
            }
    })
        .then(function (req) {
            const newToken = 'Bearer '+ req.data.access_token
            const { Client } = require('pg')
            const obtenerCategorias= async()=>{
                const client = new Client({
                    user:"",
                    host:"",
                    database:"",
                    password:"",
                    port:"",
                    ssl:{ rejectUnauthorized: false }
                })
                await client.connect()
                const res = await client.query(
                    "UPDATE th.loymark_token SET value = $1 WHERE name = 'access_token';", [newToken]
                )
                const result = res.rows
                await client.end()
                return result
            }
            obtenerCategorias().then((result)=>{   
                return
            })
    }).catch(err => {
        console.log(err)
        return
    })
}

function speedOfService(req, res){
    const tiempo ={tiempo:moment(moment().tz('America/Monterrey')).tz('America/Monterrey').format('YYYY-MM-DD')}
    
    Users.findById('62f1aac722e803510baceebd', {"_id":1, xenialToken:1},(err,reqToken)=>{

        Users.find({type: "local"}, {"_id":1, name:1, xenialId:1, newSpeedOfService:1},(err,stores)=>{
        // Users.find({xenialId: "630fab7c80166801911dc3d8"}, {"_id":1, name:1, xenialId:1},(err,stores)=>{
    

            var sitesId=[]
            var conteo=0
            // stores=[{_id: "6307da8f6a8ef843b1ee906c", name: "Fashion Drive", xenialId: "630fab7c80166801911dc3d8", speedOfService: {"tiempoDia": "00:04:26", "ticketsDia": "148", "segundosTotales": 265.64922297297295, "tiempoHour": "00:00:00"}}]
            stores.forEach(element1 => {
                if(element1.xenialId){
                    async.waterfall([

                        function step1(next) {
                            var headers2 = {
                                headers:{
                                'Content-Type': 'application/json',
                                'Authorization': reqToken.xenialToken,
                                'x-company-id': '',
                                'x-site-ids': element1.xenialId
                                }
                            }
                            axios.get('{{URL_Xenial}}/api/reporting/orders?business_date='+tiempo.tiempo + '&order_state=closed', headers2).then(reqAllSale =>{
                            // axios.get('{{URL_Xenial}}/api/reporting/orders?business_date=2023-05-09', headers2).then(reqAllSale =>{
                            if(reqAllSale && reqAllSale.data){
                                        var reqData={
                                            token: reqToken.xenialToken,
                                            orderTotal: reqAllSale.data,
                                        }
                                    }else{
                                        var reqData={
                                            token: reqToken.xenialToken,
                                        }
                                    }

                                next(null, reqData)
                            }).catch(err => {
                                console.log("err en speedOfService step1 ")
                            })
                        },
                        function step2(reqData, next) {

                            var ordenes=[]
                            var ordenesData=[]
                            if(reqData && reqData.orderTotal && reqData.orderTotal.orders){
                                reqData.orderTotal.orders.forEach((element, i)=>{
                                    if((element.destination_info.destination_name == "Dine In" || element.destination_info.destination_name == "Carry Out") && element.order_state== "closed"){
                                    if(element.time_info){
                                        if(element.time_info.closed && element.time_info.first_item_added){ // aqui me trae las ordenes cerradas solamente que tengan first_item_added
                                            var tiempo = new Date()
                                            var tim1 = (1 * 60) * 60000;
                                            var time1 = new Date(tiempo - tim1);
                                            var cerrado = new Date(element.time_info.closed)

                                            if(cerrado<=time1){   // aqui me va a traer las ordenes de una hora atras
                                            element.time_info.order_number=element.order_number
                                            element.time_info.destination_name=element.destination_info.destination_name
                                            element.time_info.order_id=element.order_id
                                            ordenes.push(element.time_info)
                                            }
                                        }
                                    }
                                    }
                                })

                            }
                            next(null, reqData, ordenes)
                        },
                        function step3(reqData, ordenes, next) {
                            var tiemp=[]
                            var days=0
                            var dayshours=0
                            var durationHour= 0
                            var indexHour = 0
                            var index = 0
                            
                            ordenes.forEach((order, i)=>{

                                if(order){
                                    var start =moment(order.first_item_added).tz('America/Monterrey')
                                    var startData = order.first_item_added

                                    if(order.kitchen_bump && order.kitchen_bump != null){
                                        var bomp =moment(order.kitchen_bump).tz('America/Monterrey')
                                        var bompData = order.kitchen_bump
                                    }else{
                                        var bomp =moment(order.updated_at).tz('America/Monterrey')
                                        var bompData = order.updated_at
                                    }
                                }
                                var duration = moment.duration(bomp.diff(start));  // dif en segundos por orden
                               if(duration.asSeconds()>2700 && duration.asSeconds()<30){ //  2700seg = 45 minutos &  30seg
                                }else{
                                    ordenes[i].durationSeconds= duration.asSeconds()
                                    days = days+(duration.asSeconds());  // sumatoria de todos los segundos
                               
                                var segundos = 0         
                                var minutos = 0         
                                var durationSeg = ""

                                var durationMin=(duration.asSeconds())/60

                                if(durationMin>=1){
                                    minutos= (durationMin.toString()).split(".")
                                    durationMin=minutos[0]
                                    var entero= parseInt(durationMin)
                                    segundos= ((ordenes[i].durationSeconds - (entero*60)).toString()).split(".")
                                    durationSeg=segundos[0]
                                }else{
                                    minutos= (durationMin.toString()).split(".")
                                    durationMin=minutos[0]
                                    segundos=(ordenes[i].durationSeconds.toString()).split(".")
                                    durationSeg=segundos[0]
                                }

                                ordenes[i].duration = durationMin+ ":"+durationSeg

                                index= index+1

                                var tiempo = new Date()
                                var tim1 = (2 * 60) * 60000;
                                var tim2 = (1 * 60) * 60000;
                                var time1 = new Date(tiempo - tim1);
                                var time2 = new Date(tiempo - tim2);

                                if(order && order.closed){
                                    var orderTime = new Date(order.closed)
                                    if(orderTime>=time1 && orderTime<=time2){
                                        if(order && order.kitchen_bump){
                                            var bompHour =moment(order.kitchen_bump).tz('America/Monterrey')
                                            var bompDataHour = order.kitchen_bump
                                            if(order && order.closed){
                                                var startHour =moment(order.closed).tz('America/Monterrey')
                                                var startDataHour = order.closed
                                            }else{
                                                var startHour =moment(order.created).tz('America/Monterrey')
                                                var startDataHour = order.created
                                            }
                                        }else{
                                            var bompHour =moment(order.updated_at).tz('America/Monterrey')
                                            var bompDataHour = order.updated_at
                                        if(order && order.created){
                                            var startHour =moment(order.created).tz('America/Monterrey')
                                            var startDataHour = order.created
                                        }else{
                                            var startHour =moment(order.closed).tz('America/Monterrey')
                                            var startDataHour = order.closed
                                        }
                                        }
                                        durationHour = moment.duration(bompHour.diff(startHour));  // dif en segundos por orden
                                        dayshours = dayshours+(durationHour.asSeconds());  // sumatoria de todos los segundos
                                        indexHour= indexHour+1
                                    }else{
                                    }
                                }else{
                                }
                                if(index==0){
                                    var durationss=0
                                }else{
                                    var durationss=days/index
                                }
                                if(indexHour==0){
                                    var durationHourrr=0
                                }else{
                                    var durationHourrr=dayshours/indexHour
                                }
                                tiemp.push({duration: durationss, durationHour: durationHourrr, porDia: index, porHora: indexHour})
                            }
                            })
                            next(null, reqData, ordenes, tiemp)
                        },
                        function step4(reqData, ordenes, tiemp, next) {
                            var hora = 0
                            var minutos = 0
                            var segundos = 0         
                            var horaHour = 0
                            var minutosHour = 0
                            var segundosHour = 0   

                            var min =(tiemp[tiemp.length-1].duration)/60
                            var minHour =(tiemp[tiemp.length-1].durationHour)/60

            if(min>=1){
                minutos =min.toString().split(".")
                minutos=minutos[0]
                var sums= 0
                for (var i = 0; i < parseInt(minutos); i++) {
                    var sums=sums+ 60
                };
                segundos= tiemp[tiemp.length-1].duration - sums
                if(segundos.toString().indexOf(".") >=0){
                    segundos=segundos.toFixed(0)
                }
                var hor =minutos/60
                if(hor>=1){
                    hora =hor.toString().split(".")
                    hora=hora[0] 
                    var ho= 0
                    for (var i = 0; i < parseInt(hora); i++) {
                        var ho=ho+ 60
                    };
                    minutos= (Number(minutos)) - ho
                }

            }else{
                segundos=tiemp[tiemp.length-1].duration.toString().split(".")
                segundos=segundos[0]
            }
            if(minutos.toString().length ==1){
                minutos="0"+minutos
            } if(segundos.toString().length ==1){
                segundos= "0"+segundos
            } if(hora.toString().length ==1){
                hora= "0"+hora
            }


            if(minHour>=1){
                minutosHour =minHour.toString().split(".")
                minutosHour=minutosHour[0]
                var sums= 0
                for (var i = 0; i < parseInt(minutosHour); i++) {
                    var sums=sums+ 60
                };
                segundosHour= tiemp[tiemp.length-1].durationHour - sums
                if(segundosHour.toString().indexOf(".") >=0){
                    segundosHour=segundosHour.toFixed(0)
                }
                var hor =minutosHour/60
                if(hor>=1){
                    horaHour =hor.toString().split(".")
                    horaHour=horaHour[0] 
                    var ho= 0
                    for (var i = 0; i < parseInt(horaHour); i++) {
                        var ho=ho+ 60
                    };
                    minutosHour= (Number(minutosHour)) - ho
                }

            }else{
                segundosHour=tiemp[tiemp.length-1].durationHour.toString().split(".")
                segundosHour=segundosHour[0]
            }
            if(minutosHour.toString().length ==1){
                minutosHour="0"+minutosHour
            } if(segundosHour.toString().length ==1){
                segundosHour= "0"+segundosHour
            } if(horaHour.toString().length ==1){
                horaHour= "0"+horaHour
            }
            var nexHour = horaHour+":"+minutosHour+":"+segundosHour

            var nex = hora+":"+minutos+":"+segundos

            var speedOfService ={
                tiempoDia: nex,
                ticketsDia: ordenes.length,
                segundosTotales: Number(tiemp[tiemp.length-1].duration),
                tiempoHour: nexHour,
                segundosTotalesHour: Number(tiemp[tiemp.length-1].durationHour),
                ticketsHour: tiemp[tiemp.length-1].porHora,
                dateUpload: new Date()
            }

            Users.findByIdAndUpdate(element1._id, {speedOfService: speedOfService}, (err, userUpdated)=>{
                if(err){
                    return
                } else{
                    console.log("FINISHHHHHHHHHH  el speed")
                    // res.status(200).send({users: nuevoLabor})
                    return
                }
            })


}
                    ])
                }else{
                }
            })
            
        })
    }).catch(err => {
        console.log("err en speedOfService step2 ")
    })
}

function ordersDay(req, res){
    OrdersDay.deleteMany({}, (err, userUpdated)=>{})
    const tiempo ={tiempo:moment().tz('America/Monterrey').format('YYYY-MM-DD')}
    Users.findById('62f1aac722e803510baceebd', {"_id":1, xenialToken:1},(err,reqToken)=>{
        Users.find({type: "local", xenialId:{$exists:true}, xenialId:{$ne:null}}, {"_id":1, name:1, xenialId:1},(err,stores)=>{
            stores.forEach(element1 => {
                if(element1.xenialId){
                    async.waterfall([
                        function step1(next) {
                            var headers2 = {
                                headers:{
                                'Content-Type': 'application/json',
                                'Authorization': reqToken.xenialToken,
                                'x-company-id': '',
                                'x-site-ids': element1.xenialId
                                }
                            }
                            axios.get('{{URL_Xenial}}/api/reporting/orders?business_date='+tiempo.tiempo+'&order_state=closed&page_number=0', headers2).then(function (reqAllSale) {
                            if(reqAllSale && reqAllSale.data){
                                if(reqAllSale.data.page_amount==0 || reqAllSale.data.page_amount==1){
                                    var reqData={
                                        token: reqToken.data,
                                        orderTotal: reqAllSale.data,
                                    }
                                    next(null, reqData)
                                }else{
                                    var reqData={
                                        token: reqToken.data,
                                        orderTotal: reqAllSale.data,
                                    }
                                    var vueltas= 1
                                    for (var i=1; i <= reqAllSale.data.page_amount-1; i++) {
                                        axios.get('{{URL_Xenial}}/api/reporting/orders?business_date='+tiempo.tiempo+'&order_state=closed&page_number='+i, headers2).then(function (reqAllSaleFor) {
                                            if(reqAllSaleFor && reqAllSaleFor.data){
                                                reqData.orderTotal.orders= [...reqData.orderTotal.orders, ...reqAllSaleFor.data.orders];
                                                vueltas++
                                                if(vueltas >= reqAllSale.data.page_amount){
                                                    next(null, reqData)
                                                }
                                            }
                                        }).catch(err => {
                                            console.log("err en speedOfService step for 1111111")
                                        })
                                      }
                                }
                                    }else{
                                        var reqData={
                                            token: reqToken.data,
                                        }
                                        next(null, reqData)
                                    }
                            }).catch(err => {
                                console.log("err en speedOfService step1 ")
                            })
                        },
                     function step2(reqData, next) {
                        var ordenes=[]
                        if(reqData && reqData.orderTotal && reqData.orderTotal.orders){
                            reqData.orderTotal.orders.forEach((element, i)=>{
                                if((element.destination_info.destination_name == "Dine In" || element.destination_info.destination_name == "Carry Out") && element.order_state== "closed"){
                                if(element.time_info){
                                    if(element.time_info.closed && element.time_info.first_item_added){ // aqui me trae las ordenes cerradas solamente que tengan closed y first_item_added
                                        var tiempo = moment().tz('America/Monterrey')
                                        var tim1 = (1 * 60) * 60000;
                                        var time1 = moment(tiempo - tim1).tz('America/Monterrey');
                                        var cerrado = moment(element.time_info.closed).tz('America/Monterrey')

                                        if(cerrado<=time1){   // aqui me va a traer las ordenes de una hora atras
                                            element.time_info.order_number=element.order_number
                                            element.time_info.destination_name=element.destination_info.destination_name
                                            element.time_info.order_id=element.order_id

                                            if(element.net_sales && element.net_sales !=null){
                                                element.time_info.net_sales=parseFloat(element.net_sales)
                                            }else{
                                                element.time_info.net_sales=parseFloat(element.subtotal)
                                            }
                                            element.time_info.order_id=element.order_id
                                            ordenes.push(element.time_info)
                                        }
                                    }
                                }
                                }
                            })
                        }

                        setTimeout(()=>{
                            // console.log(ordenes.length)
                            next(null, reqData, ordenes)
                        },7000)
                    },
                    function step3(reqData, ordenes, next) {
                            var index = 0
                            ordenes.forEach((order, i)=>{
                                if(order){
                                    var start =moment(order.first_item_added).tz('America/Monterrey')
                                    if(order.kitchen_bump && order.kitchen_bump != null){
                                        var bomp =moment(order.kitchen_bump).tz('America/Monterrey')
                                    }else{
                                        var bomp =moment(order.updated_at).tz('America/Monterrey')
                                    }
                                
                                var duration = moment.duration(bomp.diff(start));  // dif en segundos por orden
                                if(duration.asSeconds()>=30 && duration.asSeconds()<=2700){ //  2700seg = 45 minutos &  30seg
                                    ordenes[i].durationSeconds= duration.asSeconds()
                                }else{
                                    // no tendran durationSeconds
                                }

                                var start2 =moment(order.first_item_added).tz('America/Monterrey')
                                if(order.kitchen_sent && order.kitchen_sent != null){
                                    var bomp2 =moment(order.kitchen_sent).tz('America/Monterrey')
                                    var duration2 = moment.duration(bomp2.diff(start2));  // dif en segundos por tomar orden
                                    ordenes[i].orderTakingTime= duration2.asSeconds()
                                }else{
                                    // no tendran orderTakingTime
                                }
                            
                                ordenes[i].users= element1._id
                                ordenes[i].usersName= element1.name
                                index++
                                if(index >= ordenes.length){
                                    next(null, reqData, ordenes)
                                }
                                }else{
                                    index++
                                    if(index >= ordenes.length){
                                        console.log("se sale "+element1.name)
                                        next(null, reqData, ordenes)
                                    }
                                }
                            })
                        },
                        function step4(reqData, ordenes, next) {
                            OrdersDay.insertMany(ordenes, (err, userUpdated)=>{
                                if(err){
                                    return
                                } else{
                                    console.log("FINISHHHHHHHHHH")
                                    // res.status(200).send({users: nuevoLabor})
                                    return
                                }
                            })
                        }
                    ])
                }else{
                }
            })
            
        })
    }).catch(err => {
        console.log("err en speedOfService step2 ")
    })
}


function orders(req, res){
    const tiemps =moment(moment().tz('America/Monterrey')).tz('America/Monterrey').subtract(1, 'days');
    const fecha = moment(tiemps).format('YYYY-MM-DD')

    Users.findById('62f1aac722e803510baceebd', {"_id":1, xenialToken:1},(err,reqToken)=>{
        Users.find({type: "local", xenialId:{$exists:true}, xenialId:{$ne:null}}, {"_id":1, name:1, xenialId:1},(err,stores)=>{
            stores.forEach(element1 => {
                if(element1.xenialId){
                    async.waterfall([
                        function step1(next) {
                            var headers2 = {
                                headers:{
                                'Content-Type': 'application/json',
                                'Authorization': reqToken.xenialToken,
                                'x-company-id': '',
                                'x-site-ids': element1.xenialId
                                }
                            }
                            axios.get('{{URL_Xenial}}/api/reporting/orders?business_date='+fecha+'&order_state=closed&page_number=0', headers2).then(function (reqAllSale) {
                            if(reqAllSale && reqAllSale.data){
                                if(reqAllSale.data.page_amount==0 || reqAllSale.data.page_amount==1){
                                    var reqData={
                                        token: reqToken.data,
                                        orderTotal: reqAllSale.data,
                                    }
                                    next(null, reqData)
                                }else{
                                    var reqData={
                                        token: reqToken.data,
                                        orderTotal: reqAllSale.data,
                                    }
                                    var vueltas= 1
                                    for (var i=1; i <= reqAllSale.data.page_amount-1; i++) {
                                        axios.get('{{URL_Xenial}}/api/reporting/orders?business_date='+fecha+'&order_state=closed&page_number='+i, headers2).then(function (reqAllSaleFor) {
                                            if(reqAllSaleFor && reqAllSaleFor.data){
                                                reqData.orderTotal.orders= [...reqData.orderTotal.orders, ...reqAllSaleFor.data.orders];
                                                vueltas++
                                                if(vueltas >= reqAllSale.data.page_amount){
                                                    next(null, reqData)
                                                }
                                            }
                                        }).catch(err => {
                                            console.log("err en speedOfService step for 22222")
                                        })
                                      }
                                }
                                    }else{
                                        var reqData={
                                            token: reqToken.data,
                                        }
                                        next(null, reqData)
                                    }
                            }).catch(err => {
                                console.log("err en speedOfService step1 ")
                            })
                        },
                     function step2(reqData, next) {
                        var ordenes=[]
                        if(reqData && reqData.orderTotal && reqData.orderTotal.orders){
                            reqData.orderTotal.orders.forEach((element, i)=>{
                                if((element.destination_info.destination_name == "Dine In" || element.destination_info.destination_name == "Carry Out") && element.order_state== "closed"){
                                if(element.time_info){
                                    if(element.time_info.closed && element.time_info.first_item_added){ // aqui me trae las ordenes cerradas solamente que tengan closed y first_item_added
                                        element.time_info.order_number=element.order_number
                                        element.time_info.destination_name=element.destination_info.destination_name
                                        element.time_info.order_id=element.order_id

                                        if(element.net_sales && element.net_sales !=null){
                                            element.time_info.net_sales=parseFloat(element.net_sales)
                                        }else{
                                            element.time_info.net_sales=parseFloat(element.subtotal)
                                        }
                                        element.time_info.order_id=element.order_id
                                        ordenes.push(element.time_info)
                                    }
                                }
                                }
                            })
                        }

                        setTimeout(()=>{
                            // console.log(ordenes.length)
                            next(null, reqData, ordenes)
                        },7000)
                    },
                    function step3(reqData, ordenes, next) {
                            var index = 0
                            ordenes.forEach((order, i)=>{
                                if(order){
                                    var start =moment(order.first_item_added).tz('America/Monterrey')
                                    if(order.kitchen_bump && order.kitchen_bump != null){
                                        var bomp =moment(order.kitchen_bump).tz('America/Monterrey')
                                    }else{
                                        var bomp =moment(order.updated_at).tz('America/Monterrey')
                                    }
                                
                                var duration = moment.duration(bomp.diff(start));  // dif en segundos por orden
                                if(duration.asSeconds()>=30 && duration.asSeconds()<=2700){ //  2700seg = 45 minutos &  30seg
                                    ordenes[i].durationSeconds= duration.asSeconds()
                                }else{
                                    // no tendran durationSeconds
                                }

                                var start2 =moment(order.first_item_added).tz('America/Monterrey')
                                if(order.kitchen_sent && order.kitchen_sent != null){
                                    var bomp2 =moment(order.kitchen_sent).tz('America/Monterrey')
                                    var duration2 = moment.duration(bomp2.diff(start2));  // dif en segundos por tomar orden
                                    ordenes[i].orderTakingTime= duration2.asSeconds()
                                }else{
                                    // no tendran orderTakingTime
                                }

                                ordenes[i].users= element1._id
                                ordenes[i].usersName= element1.name
                                index++
                                if(index >= ordenes.length){
                                    next(null, reqData, ordenes)
                                }
                                }else{
                                    index++
                                    if(index >= ordenes.length){
                                        console.log("se sale "+element1.name)
                                        next(null, reqData, ordenes)
                                    }
                                }
                            })
                        },
                        function step4(reqData, ordenes, next) {
                            Orders.insertMany(ordenes, (err, userUpdated)=>{
                                if(err){
                                    return
                                } else{
                                    console.log("FINISHHHH-ORDERS")
                                    // res.status(200).send({users: nuevoLabor})
                                    return
                                }
                            })
                        }
                    ])
                }else{
                }
            })
            
        })
    }).catch(err => {
        console.log("err en speedOfService step2 ")
    })
}


function laborXHora(req, res){
    const tiemps =moment(moment().tz('America/Monterrey')).tz('America/Monterrey').subtract(1, 'days');
    const fecha = moment(tiemps).format('YYYY-MM-DD')

    Users.findById('62f1aac722e803510baceebd', {"_id":1, xenialToken:1},(err,reqToken)=>{
        Users.find({type: "local", xenialId:{$exists:true}, xenialId:{$ne:null} }, {"_id":1, name:1, xenialId:1},(err,stores)=>{

            stores.forEach(element => {
                        if(element.xenialId){
                            async.waterfall([
                                function step1(next) {
                                    var headers3 = {
                                        headers:{
                                        'Content-Type': 'application/json',
                                        'Authorization': reqToken.xenialToken,
                                        'x-company-id': '',
                                        'x-site-ids': element.xenialId
                                        }
                                    }

                                    // aqui saco la venta pero por cada hora del dia (solo dinero y cantidad de ordenes)
                                    axios.get('{{URL_Xenial}}/api/reporting/sales-by-time?business_date='+fecha, headers3).then(reqAllSaleXTime =>{
                                        var reqAllSaleXTime= reqAllSaleXTime.data
                                        next(null, reqAllSaleXTime)
                                    }).catch(err => {
                                        console.log("err en laborXHora step2 ")
                                    })
                                },
                                function step2(reqAllSaleXTime, next) {

                                    var headers4 = {
                                        headers:{
                                        'Content-Type': 'application/json',
                                        'Authorization': reqToken.xenialToken,
                                        'x-company-id': '',
                                        'x-site-ids': element.xenialId
                                        }
                                    }

                                    // aqui se consulta cuantos empleados estan en labor, cuanto se le esta pagando y horas trabajadas
                                    axios.get('{{URL_Xenial}}/Payroll/PayrollDetail/GetBy?fieldName=BusinessDate&value='+fecha, headers4).then(reqAllLabor =>{
                                        
                                        var arrayRespuesta = reqAllLabor.data.Data
                                        var nuevoArray    = []
                                        var arrayTemporal = []
                                        for(var i=0; i<arrayRespuesta.length; i++){
                                            arrayTemporal = nuevoArray.filter(resp => resp["Nombre"] == arrayRespuesta[i]["EmployeeId"])
                                            if(arrayTemporal.length>0){
                                                nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["Profesionales"].push({ pay:arrayRespuesta[i]["TotalPay"], hours:arrayRespuesta[i]["Hours"], clockIn:arrayRespuesta[i]["ClockIn"], clockOut:arrayRespuesta[i]["ClockOut"], employeeWorkTimeId:arrayRespuesta[i]["EmployeeWorkTimeId"]})
                                            }else{
                                                nuevoArray.push({"Nombre" : arrayRespuesta[i]["EmployeeId"] , "Profesionales" : [{ pay:arrayRespuesta[i]["TotalPay"], hours:arrayRespuesta[i]["Hours"], clockIn:arrayRespuesta[i]["ClockIn"], clockOut:arrayRespuesta[i]["ClockOut"], employeeWorkTimeId:arrayRespuesta[i]["EmployeeWorkTimeId"]} ]})
                                            }
                                        }

                                    nuevoArray.forEach((element, i) => {
                                        var num = 0
                                        var numH = 0
                                        element.Profesionales.forEach((element2,y)=>{
                                            if(element2.pay){
                                                num = num + element2.pay
                                                nuevoArray[i].sumPay = num
                                            }
                                            if(element2.hours){
                                                numH = numH + element2.hours
                                                nuevoArray[i].sumHours = numH
                                            }
                                            if(element2.clockIn){
                                                if(nuevoArray[i].clockIn){
                                                    if(element2.clockIn < nuevoArray[i].clockIn){
                                                        nuevoArray[i].clockIn = (element2.clockIn)
                                                    }
                                                }else{
                                                    nuevoArray[i].clockIn = (element2.clockIn)
                                                }
                                            }
                                            if(element2.clockOut){
                                                if(nuevoArray[i].clockOut){
                                                    if(element2.clockOut > nuevoArray[i].clockOut){
                                                        nuevoArray[i].clockOut = (element2.clockOut)
                                                    }
                                                }else{
                                                    nuevoArray[i].clockOut = (element2.clockOut)
                                                }
                                            }
                                        });
                                    })

                                next(null, reqAllSaleXTime, nuevoArray)

                                        }).catch(err => {
                                            console.log("err en labor step4 xHour ")
                                            console.log(element.name)
                                        })
                                },

                                function step3(reqAllSaleXTime, nuevoArray, next) {

                                    var newClockIn
                                    var newClockOut
                                    nuevoArray.forEach((element3,index)=>{
                                        if(newClockIn){
                                            if(element3.clockIn < newClockIn){
                                                newClockIn=element3.clockIn
                                            }
                                        }else{
                                            newClockIn=element3.clockIn
                                        }
                                        if(newClockOut){
                                            if(element3.clockOut > newClockOut){
                                                newClockOut=element3.clockOut
                                            }
                                        }else{
                                            newClockOut=element3.clockOut
                                        }

                                    })

                                    const newClockIn1 = new Date(newClockIn)
                                    const newClockOut1 = new Date(newClockOut)

                                    const newClockIn2 = newClockIn1
                                    const newClockOut2 = newClockOut1
                                    const horasEntreFechas = [];

                                    while (newClockIn2 < newClockOut2) {
                                    const newClockInISO = newClockIn2.toISOString();
                                    
                                    // Clonar la fecha para no modificar la original
                                    const newClockOut2Clone = new Date(newClockIn2);
                                    
                                    // Sumar una hora a la fecha clonada
                                    newClockOut2Clone.setHours(newClockOut2Clone.getHours() + 1);

                                    const newClockOutISO = newClockOut2Clone.toISOString();
                                    
                                    // Agregar el rango al arreglo
                                    horasEntreFechas.push({ "start": newClockInISO, "end": newClockOutISO, "login":[] });

                                    // Incrementar la fecha original
                                    newClockIn2.setHours(newClockIn2.getHours() + 1);
                                    }

                                    const horasEntreFechasFormateadas = horasEntreFechas.map(rango => ({
                                        start: DateTime.fromISO(rango.start, { zone: 'America/Mexico_City' }).toFormat('yyyy-MM-dd\'T\'HH:mm:ssZZZ'),
                                        end: DateTime.fromISO(rango.end, { zone: 'America/Mexico_City' }).toFormat('yyyy-MM-dd\'T\'HH:mm:ssZZZ'),
                                        login: rango.login
                                      }));
                                      
                                next(null, reqAllSaleXTime, nuevoArray, horasEntreFechasFormateadas)
                            },

                            function step4(reqAllSaleXTime, nuevoArray, horasEntreFechasFormateadas, next) {

                                nuevoArray.forEach((empleado,index1) => {
                                    var empleadoClokIn = new Date(empleado.clockIn)
                                    var empleadoClokOut = new Date(empleado.clockOut)
                                    var newClockIn= empleadoClokIn
                                    var newClockOut = new Date(empleadoClokOut);
                                        newClockOut.setHours(newClockOut.getHours() - 1);
                                                                        
                                    horasEntreFechasFormateadas.forEach((intervalo1, index2)=>{
                                        var intervalStart = new Date(intervalo1.start)
                                        var intervalEnd = new Date(intervalo1.end)

                                        if( (newClockIn >= intervalStart && newClockIn < intervalEnd) ){

                                            horasEntreFechasFormateadas[index2].login.push(1)
                                            horasEntreFechasFormateadas[index2].plantillaXHour= horasEntreFechasFormateadas[index2].login.length 
                                            horasEntreFechasFormateadas[index2].users= element._id
                                            horasEntreFechasFormateadas[index2].usersName= element.name
                                        
                                            var startNormalFormat= new Date(intervalo1.start)
                                            startNormalFormat.setHours(startNormalFormat.getHours() - 6)
                                            horasEntreFechasFormateadas[index2].startNormalFormat= startNormalFormat

                                            var endNormalFormat= new Date(intervalo1.end)
                                            endNormalFormat.setHours(endNormalFormat.getHours() - 6)
                                            horasEntreFechasFormateadas[index2].endNormalFormat= endNormalFormat

                                        }


                                        reqAllSaleXTime.sales_data.forEach((rango,indexes)=>{
                                            var saleIntStart= new Date(rango.interval_start)
                                            var saleIntEnd= new Date(rango.interval_end)
                                            var newStartNormalFormat= new Date(startNormalFormat)
                                            var newEndNormalFormat= new Date(endNormalFormat)

                                            if (newStartNormalFormat.getTime() === saleIntStart.getTime() && newEndNormalFormat.getTime() === saleIntEnd.getTime() ) {
                                                horasEntreFechasFormateadas[index2].net_salesXHour= parseFloat(rango.net_sales)
                                                horasEntreFechasFormateadas[index2].guest_countXHour= parseInt(rango.guest_count)
                                            }

                                        })


                                        if( newClockIn >= intervalStart && newClockIn <= intervalEnd){

                                            if( newClockIn < newClockOut){
                                                newClockIn.setHours(newClockIn.getHours() + 1);
                                            }
                                            // tengo que ver este punto porque examina el 2023-12-18 al TM 655b8ea52d50d8f9d338fe34 le falta un logeo de las 20 a las 21
                                        }
                                    })
                                })

                                next(null, reqAllSaleXTime, nuevoArray, horasEntreFechasFormateadas)
                            },


                            function step5(reqAllSaleXTime, nuevoArray, horasEntreFechasFormateadas, next) {
                                LaborXHours.insertMany(horasEntreFechasFormateadas, (err, userUpdated)=>{
                                    if(err){
                                        return
                                    } else{
                                        console.log("FINISHHHH-Labor-X-Hour")
                                        return
                                    }
                                })
                            }



                                
                            ])
                        }else{
                        }
                    })

                })
            }).catch(err => {
                console.log("err en laborXHora step1 ")
            })



}


function laborDay(req, res){
    const tiemps =moment(moment().tz('America/Monterrey')).tz('America/Monterrey').subtract(1, 'days');
    const fecha = moment(tiemps).format('YYYY-MM-DD')

        Users.findById('62f1aac722e803510baceebd', {"_id":1, xenialToken:1},(err,reqToken)=>{
         Users.find({type: "local", xenialId:{$exists:true}, xenialId:{$ne:null} }, {"_id":1, name:1, xenialId:1},(err,stores)=>{
                        var sitesId=[]
                        var conteo=0
    
                        if(stores.length>=0){
                        stores.forEach(element => {
                                async.waterfall([
                                    function step1(next) {
                                        var headers2 = {
                                            headers:{
                                            'Content-Type': 'application/json',
                                            'Authorization': reqToken.xenialToken,
                                            'x-company-id': '',
                                            'x-site-ids': element.xenialId
                                            }
                                        }
    
                                        // aqui saco la venta total del dia (solo la cantidad de dinero y cantidad de ordenes)
                                        axios.get('{{URL_Xenial}}/api/reporting/calculations?start_business_date='+fecha+'&end_business_date='+fecha, headers2).then(reqAllSale =>{
                                            if(reqAllSale && reqAllSale.data && reqAllSale.data.sections.calculations.net_sales){
                                            }else{
                                                reqAllSale.data.sections.calculations.net_sales={"total": "0", "quantity": "0"}
                                            }
                                            var reqData={
                                                token: reqToken.xenialToken,
                                                saleTotal: reqAllSale.data.sections.calculations.net_sales // aqui saco la venta total del dia y cantidad de tickets
                                            }
                                            next(null, reqData)
                                        }).catch(err => {
                                            console.log("err en laborDay step1 ")
                                        })
                                    },

                                    function step2(reqData, next) {
                                        var headers2 = {
                                            headers:{
                                            'Content-Type': 'application/json',
                                            'Authorization': reqToken.xenialToken,
                                            'x-company-id': '',
                                            'x-site-ids': element.xenialId
                                            }
                                        }
                                        // aqui se consulta cuantos empleados estan en labor, cuanto se le esta pagando y horas trabajadas
                                        axios.get('{{URL_Xenial}}/Payroll/PayrollDetail/GetBy?fieldName=BusinessDate&value='+fecha, headers2).then(reqAllLabor =>{
                                            if(reqAllLabor && reqAllLabor.data && reqAllLabor.data.Data){
                                                var arrayRespuesta = reqAllLabor.data.Data
                                                var nuevoArray    = []
                                                var arrayTemporal = []
                                                for(var i=0; i<arrayRespuesta.length; i++){
                                                    arrayTemporal = nuevoArray.filter(resp => resp["Nombre"] == arrayRespuesta[i]["EmployeeId"])
                                                    if(arrayTemporal.length>0){
                                                        nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["Profesionales"].push({pay:arrayRespuesta[i]["TotalPay"], hours:arrayRespuesta[i]["Hours"]})
                                                    }else{
                                                        nuevoArray.push({"Nombre" : arrayRespuesta[i]["EmployeeId"] , "Profesionales" : [{pay:arrayRespuesta[i]["TotalPay"], hours:arrayRespuesta[i]["Hours"]} ]})
                                                    }
                                                }
                                            }else{
                                                nuevoArray=[]
                                            }
                                            nuevoArray.forEach((element2, i) => {
                                                var num = 0
                                                var numH = 0
                                                element2.Profesionales.forEach((element3,y)=>{
                                                    if(element3.pay){
                                                        num = num + element3.pay
                                                        nuevoArray[i].sum = num
                                                    }
                                                    if(element3.hours){
                                                        numH = numH + element3.hours
                                                        nuevoArray[i].sumHour = numH
                                                    }
                                                });
                                            })
                                            next(null, reqData, nuevoArray)
                                        }).catch(err => {
                                            console.log("err en laborDay step2 ")
                                        })
                                    },


                                    function step3(reqData, nuevoArray, next) {

                                        var laborCost= 0
                                        var laborHours= 0
                                        nuevoArray.forEach((element4,i)=>{
                                            if(element4.sum){
                                                laborCost = element4.sum + laborCost
                                            }
                                            if(element4.sumHour){
                                                laborHours = element4.sumHour + laborHours
                                            }
                                        })

                                        laborCost= Number(laborCost).toFixed(2)
                                        laborHours=Number(laborHours).toFixed(2)
                                        var numVenta= Number(reqData.saleTotal.quantity)
                                        var plantillaTotal= nuevoArray.length
                                        var venta= Number(reqData.saleTotal.total)

                                        if(venta>0){
                                            var laborCostPorcent = ((laborCost*100)/venta).toFixed(2)    
                                        }else{
                                            var laborCostPorcent = 0   
                                        }

                                        var users= element._id
                                        var usersName= element.name
                                        var date= new Date(tiemps)  

                                        var xenialLabor={
                                            laborCost: parseFloat(laborCost),
                                            laborHours: parseFloat(laborHours),
                                            venta: venta,
                                            numVenta: numVenta,
                                            plantillaTotal: plantillaTotal,
                                            laborCostPorcent : parseFloat(laborCostPorcent),
                                            users: users,
                                            usersName: usersName,
                                            date: date
                                        }
                                        next(null, reqData, nuevoArray, xenialLabor)
                                    },

                                    function step4(reqData, nuevoArray, xenialLabor, next) {
                                        LaborDay.insertMany(xenialLabor, (err, userUpdated)=>{
                                            if(err){
                                                return
                                            } else{
                                                console.log("FINISHHHH-LABOR--DAY")
                                                return
                                            }
                                        })

                                    }
                                ])
                        })}
                    })
                }).catch(err => {
                    console.log("err en laborDay pedir al usuarios para el token ")
                })
    




}

function autoCompleteIssues(req, res){
    Requests.find({}, {_id:1, issue:1, issueMore:1},(err, request)=>{

          request.forEach((element, i)=>{
            var element1= element.issue.toString()
            var element2= element.issueMore._id.toString()

            if( element1 != element2 ){
                Requests.findByIdAndUpdate(element._id,{issue: mongoose.Types.ObjectId(element2)},(err, requests)=>{
                    return
                })
            }else{
                return
            }
          })
    })
}

function autoCodeRequestDuplicate(req, res){
    Requests.aggregate([
        {
            $group: {
              _id: '$codeRequest',
              id:{ $last: "$_id" },
              count: { $sum: 1 }
            }
          },
          {
            $match: {
              count: { $gt: 1 }
            }
          }

    ]).allowDiskUse(true).exec()
    .then(requests2 => {
        if(requests2){
            requests2.forEach((element, i)=>{
                var concatenado= element._id+"-2"
                Requests.findByIdAndUpdate(element.id, {codeRequest: concatenado}, (err, userUpdated)=>{
                    if(err){
                        return
                    } else{
                        console.log("concat "+ userUpdated.codeRequest)
                        return
                    }
                })
            })
        }
    })    
}

function autoClosed(req, res){
    Requests.find(
        {
            $and:[
                {'status': {$ne:'Solucionado'}},
                {'status': {$ne:'SolucionadoPreventivo'}},
                {'status': {$ne:'AutoSolucionado'}},
                {'statusCallCenter': {$ne:'SolucionadoCallCenter'}},
                {'statusCallCenter': {$ne:'SolucionadoPreventivoCallCenter'}},
                {'statusCallCenter': {$ne:'AutoSolucionado'}},
                {'notes.0': {$exists: true}}
            ],
        }
        ,(err, requests)=>{
            var newReq =[]
            requests.forEach((element, index)=>{
                if(element.notes[element.notes.length-1].esperaRespuesta==true){
                    newReq.push(element)    // todos los que esten a la espera de contestacion, que sean timckets abiertos
                }
            })

            setTimeout(()=>{

                newReq.forEach((element2, index2)=>{

                    var finicial =moment(element2.notes[element2.notes.length-1].dateOfNote).tz('America/Monterrey')
                    var ffinal =moment().tz('America/Monterrey')
                    var minutos = ffinal.diff(finicial, 'minutes')
                    var arr= (minutos/60).toString().split(".")
                    if(parseInt(arr[0])>48){   // me trea todos los que no han respondido en mas de 48 horas
                        
                        const reqs = element2
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

                            if(reqs.status && (reqs.status=="Nuevo" ||reqs.status=="Pendiente" ||reqs.status=="Asignado" )){
                                if(reqs.issueMore.sla <= reqs.solutionTimeHours){
                                    reqs.vencidoH= "si"
                                }
                            }else{
                                if(reqs.issueMore.sla <= reqs.solutionTimeHours){
                                    reqs.vencidoCallCenter= "si"
                                }
                            }

                        if(reqs.statusCallCenter && (reqs.statusCallCenter== "NuevoCallCenter" || reqs.statusCallCenter=="PendienteCallCenter" )){
                            Users.find({'type': 'callCenter'},(err, requests4)=>{
                                if (err) {
                                    console.error(err);
                                    return;
                                  }
                                  var emails = requests4.map(request => request.email);
                                  reqs.textAnalist = emails.join(';');
                                  next(null, reqs)
                            })
                        }else{
                            if(reqs.issueMore.zonesToAnalyst && reqs.issueMore.zonesToAnalyst.porEstado==true){

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

                            }else{
                                reqs.sendsAnalist = reqs.issueMore.emailToSendAnalist.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                reqs.sendsCopy = reqs.issueMore.emailToSendCopy.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
                                next(null, reqs)
                            }
                        }
                            

                            },

                            function step2(reqs, next) {
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
                                    let textAnalist = "";
                                    let textCopy = "";
                                    if (reqs.issueMore.emailToSendAnalist && reqs.issueMore.emailToSendAnalist[0] != null) {
                                      textAnalist = await getEmails(reqs.issueMore.emailToSendAnalist);
                                    }
                                    if (reqs.issueMore.emailToSendCopy && reqs.issueMore.emailToSendCopy[0] != null) {
                                      textCopy = await getEmails(reqs.issueMore.emailToSendCopy);
                                    }

                                    reqs.sendsAnalist= reqs.reportBy.email+";"+textAnalist
                                    reqs.sendsCopy= textCopy

                                    var email={
                                        textAnalist: reqs.reportBy.email+";"+textAnalist,
                                        textCopy: textCopy
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


                            function step3(reqs, email, next) {

                                if(reqs.statusCallCenter && (reqs.statusCallCenter== "NuevoCallCenter" || reqs.statusCallCenter=="PendienteCallCenter" )){

                                    var query= {
                                        statusCallCenter: "AutoSolucionado",
                                        solutionCallCenter: 'Buen día team, Hace algunos días se envió un mensaje a este folio. Como no hemos recibido respuesta, procedemos a cerrar el Timcket. No obstante, si necesita ayuda adicional, puede crear un nuevo Timcket. Saludos!',
                                        solution: 'Buen día team, Hace algunos días se envió un mensaje a este folio. Como no hemos recibido respuesta, procedemos a cerrar el Timcket. No obstante, si necesita ayuda adicional, puede crear un nuevo Timcket. Saludos!',
                                        solutionBySucursal: "no",
                                        dateLastUpdate: new Date(),
                                        dateSolutionCallCenter: new Date(),
                                        solutionTime: reqs.solutionTime,
                                        solutionTimeHours:reqs.solutionTimeHours,
                                        vencidoCallCenter: reqs.vencidoCallCenter,
                                        esperaRespuesta: null,
                                    }


                                }else{

                                    var query= {
                                        status: "AutoSolucionado",
                                        solutionTime: reqs.solutionTime,
                                        dateSolution: new Date(),
                                        solution: 'Buen día team, Hace algunos días se envió un mensaje a este folio. Como no hemos recibido respuesta, procedemos a cerrar el Timcket. No obstante, si necesita ayuda adicional, puede crear un nuevo Timcket. Saludos!',
                                        solutionBySucursal: "no",
                                        solutionTimeHours: reqs.solutionTimeHours,
                                        vencidoH: reqs.vencidoH,
                                        dateLastUpdate: new Date(),
                                        esperaRespuesta: null,
                                    }

                                }



                                setTimeout(()=>{
                        Requests.findByIdAndUpdate(reqs._id,query,(err, requests)=>{
                    
                            var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> AutoSolucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"> </td> </tr> <tr>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
                            // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> AutoSolucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://timckets.timhortonsmx.com/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"> </td> </tr> <tr>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
                            // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="800" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> AutoSolucionado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest3>" style="color: #c90d0de3">  <b><CodeRequest></b> </a> </td> </tr> </table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr>  <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>  <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Solucion: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Note></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:5px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-top:5px;"><div> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Servicio: </b><Service></td> </tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 8px;"><b>Descripción: </b><Description></td> </tr>    <table> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:16px; padding-top: 1%;"></td> </tr> <tr>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'

                            HTML = HTML.replace("<CodeRequest>", reqs.codeRequest);
                            HTML = HTML.replace("<CodeRequest2>", reqs.codeRequest);
                            HTML = HTML.replace("<CodeRequest3>", reqs.codeRequest);        
                            HTML = HTML.replace("<CodeRequest4>", reqs.codeRequest);        
                            HTML = HTML.replace("<CodeRequest5>", reqs.codeRequest);        
                            HTML = HTML.replace("<SubCategory>", reqs.issue.subcategory);
                            HTML = HTML.replace("<Service>", reqs.issue.service);
                            HTML = HTML.replace("<Description>", reqs.description);
                            HTML = HTML.replace("<Note>", 'Buen día team, Hace algunos días se envió un mensaje a este folio. Como no hemos recibido respuesta, procedemos a cerrar el Timcket. No obstante, si necesita ayuda adicional, puede crear un nuevo Timcket. Saludos!');
                            HTML = HTML.replace("<ReportBy>", reqs.reportBy.name);
                            HTML = HTML.replace("<Direccion>", reqs.reportBy.street + " " + reqs.reportBy.numExt + " " + reqs.reportBy.numInt + " " + reqs.reportBy.suburb + " " + reqs.reportBy.municipality + " " + reqs.reportBy.state);

                            return transporter.sendMail({
                                from: '...@...',
                                to: email.textAnalist,
                                cc: email.textCopy,
                                subject: 'AutoCierre de folio ' + reqs.codeRequest + ' | ' + reqs.issue.subcategory, // Subject line
                                html: HTML
                                }, function (error, info) {
                                    console.log("autoClosed", reqs.codeRequest)
                                    // console.log("enviado a: " + reqs.sendsAnalist + " y cc: " + reqs.sendsCopy)
                                        return
                                });
                            })
                                },4000)
                            }
                        ], function (err) {
                            return
                            console.log(err);
                        });
                    }
                })
            },4000)
        }).populate("reportBy issue")
}









function autoEscalamiento (req, res){
    Requests.aggregate([
        {
            $match: { 
                $and:[
                
                {'status': {$exists:false}},
                    {
                        'statusCallCenter': "NuevoCallCenter"
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
    requests2.forEach( (element, i) => {


        if(element.notes && element.notes.length>0){
            // los que tienen mensajes en bitacora
            var ars =0
            var ffinal = null
            var ahora = null
            var momentDia= null

            element.notes.forEach((elementNote, indiceNote) => {
              if(elementNote.esperaRespuesta && elementNote.esperaRespuesta==true){
                // los que tienen minimo un "en espera de respuesta" 

                if(elementNote.noteBy.indexOf("Call")>=0){                  
                  ffinal =moment().tz('America/Monterrey')
                  ahora = moment(new Date()).tz('America/Monterrey').format('HH')
                  momentDia= moment().tz('America/Monterrey').format('DD')

                }else{
                  if(element.notes[indiceNote+1]){
                    // los que tienen mas mensajes

                    var start =moment(elementNote.dateOfNote)
                    var end=moment(element.notes[indiceNote+1].dateOfNote)
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

          var fechaFinal = moment(element.dateOfReport).add(ars, 'minutes');

          element.dateOfReport= fechaFinal

        var totalHorasRestadas=0
        var totalMinRestadas =0
        var finicial =moment(element.dateOfReport).tz('America/Monterrey')
        var minutos = ffinal.diff(finicial, 'minutes')
        var arr= (minutos/60).toString().split(".")

             
        var ar = parseInt(arr[0])
        var astring =(ar/24).toString()
        var totalDias = parseInt(astring,10)
    
        var puraHora= moment(element.dateOfReport).tz('America/Monterrey').format('HH')
        var horario1= moment('2023-04-26T14:00:00.000+00:00').tz('America/Monterrey').format('HH')
        var horario2= moment('2023-04-27T01:00:00.000+00:00').tz('America/Monterrey').format('HH')            
    
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
                    if(moment(element.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                      totalHorasTrabajadas= (parseInt(ahora) - parseInt(horario1))
                    }else{
                      totalHorasTrabajadas= totalHorasRestadas+ (parseInt(ahora) - parseInt(horario1))                        }
                  }else{
                    if(puraHora>horario2){
                        if(ahora<"08"){
                            totalHorasTrabajadas= totalHorasRestadas
                        }else{
                            if(moment(element.dateOfReport).tz('America/Monterrey').format('DD') ==((momentDia) -1)){
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
            if(moment(element.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                if((parseInt(ahora)) >= ((parseInt(horario2))+1)){
                    totalHorasRestadas = (parseInt(ahora)) - ((parseInt(horario2))+1)
                }
            }else{
                if(moment(element.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
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
                    if(moment(element.dateOfReport).tz('America/Monterrey').format('DD') == momentDia){
                        totalHorasRestadas = ((parseInt(moment('2023-04-26T04:00:00.000+00:00').tz('America/Monterrey').format('HH')))-(parseInt(puraHora)-(parseInt(moment('2023-04-26T06:00:00.000+00:00').tz('America/Monterrey').format('HH')))))
                        totalHorasRestadas= totalHorasRestadas+8
                    }else{
                        totalHorasRestadas = ((parseInt(moment('2023-04-26T05:00:00.000+00:00').tz('America/Monterrey').format('HH')))-(parseInt(puraHora)-1))
                        totalHorasRestadas= totalHorasRestadas+8
                    }
                }
    
            }
        }
    
        setTimeout(()=>{
        if(totalHorasTrabajadas){
          totalMinRestadas= totalHorasTrabajadas*60
          var newMinutos= totalMinRestadas
        }else{
          totalMinRestadas= totalHorasRestadas*60
          var newMinutos= minutos-totalMinRestadas
        }
    
        var arr= (newMinutos/60).toString().split(".")
        var ar = parseInt(arr[0])
        var astring =(ar/24).toString()
        var totalDias = parseInt(astring,10)

        if(parseInt(ar)>parseInt(element.issueMore.slaCallCenter)){
            async.waterfall([
                function step1(next) {

        element.status = "Nuevo"
        element.statusCallCenter = "AsignadoCallCenter"
        element.vencidoCallCenter = "si"
        element.motivoAsignadoCallCenter= "AutoEscalado"

if(element.issueMore.zonesToAnalyst && element.issueMore.zonesToAnalyst.porEstado == true){

    if(element.reportBy && element.reportBy.state){

        if(element.reportBy.state =="NuevoLeón"){
            element.issueMore.emailToSendAnalist = element.issueMore.zonesNL.zonesNLAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
            element.issueMore.emailToSendCopy = element.issueMore.zonesNL.zonesNLCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
            element.issueMore.zonesNL.zonesNLAnalyst= element.issueMore.emailToSendAnalist
            element.issueMore.zonesNL.zonesNLCopiados= element.issueMore.emailToSendCopy
            next(null, element)
        }

        if(element.reportBy.state =="Coahuila"){
            element.issueMore.emailToSendAnalist = element.issueMore.zonesCoahila.zonesCoahilaAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
            element.issueMore.emailToSendCopy = element.issueMore.zonesCoahila.zonesCoahilaCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
            element.issueMore.zonesCoahila.zonesCoahilaAnalyst= element.issueMore.emailToSendAnalist
            element.issueMore.zonesCoahila.zonesCoahilaCopiados= element.issueMore.emailToSendCopy
            next(null, element)
        }

        if(element.reportBy.state =="Querétaro"){
            element.issueMore.emailToSendAnalist = element.issueMore.zonesQueretaro.zonesQueretaroAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
            element.issueMore.emailToSendCopy = element.issueMore.zonesQueretaro.zonesQueretaroCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
            element.issueMore.zonesQueretaro.zonesQueretaroAnalyst= element.issueMore.emailToSendAnalist
            element.issueMore.zonesQueretaro.zonesQueretaroCopiados= element.issueMore.emailToSendCopy
            next(null, element)
        }

        if(element.reportBy.state =="Estado-de-México"){
            element.issueMore.emailToSendAnalist = element.issueMore.zonesMexico.zonesMexicoAnalyst.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
            element.issueMore.emailToSendCopy = element.issueMore.zonesMexico.zonesMexicoCopiados.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
            element.issueMore.zonesMexico.zonesMexicoAnalyst= element.issueMore.emailToSendAnalist
            element.issueMore.zonesMexico.zonesMexicoCopiados= element.issueMore.emailToSendCopy
            next(null, element)
        }
    }
}else {
    element.issueMore.emailToSendAnalist = element.issueMore.emailToSendAnalist.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
    element.issueMore.emailToSendCopy = element.issueMore.emailToSendCopy.filter(item => item !== null).map(item => mongoose.Types.ObjectId(item));
    next(null, element)
}


},
function step2(element, next) {

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
    if (element.issueMore.emailToSendAnalist && element.issueMore.emailToSendAnalist[0] != null) {
      textAnalist = await getEmails(element.issueMore.emailToSendAnalist);
    }
    if (element.issueMore.emailToSendCopy && element.issueMore.emailToSendCopy[0] != null) {
      textCopy = await getEmails(element.issueMore.emailToSendCopy);
    }
    var email={
        textAnalist: textAnalist,
        textCopy: textCopy
    }

    setTimeout(()=>{
        next(null, element, email)
    }, 3000)
  }
  main();
    }, 

    function step3(element, email, next) {
        Requests.findByIdAndUpdate(element._id,{status: element.status, statusCallCenter: element.statusCallCenter, vencidoCallCenter: element.vencidoCallCenter, motivoAsignadoCallCenter: element.motivoAsignadoCallCenter, dateLastUpdate: new Date(), dateAssignmentCallCenter:  new Date()},(err, requests)=>{

                        var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket AutoEscalado </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="https://soporte.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
                        // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="https://timckets.timhortonsmx.com/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="http://timckets.timhortonsmx.com/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>   <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'
                        // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title> Cambiar Contraseña </title> </head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"> <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr> <td><table width="84" border="0" cellspacing="0" cellpadding="0"> <tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"> <div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div> </td> </tr></table>  </td>  </tr> <tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"> <tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;"> Nuevo Timcket </td>    </tr> <tr> <td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 0%;"> <a href="http://localhost:4200/requestDetail/<CodeRequest3>">  <b><CodeRequest></b> </a> </td> </tr></table> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:5px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px;"><b>Subcategoría: </b><SubCategory></td></tr><tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:17px; padding-bottom:5px; padding-top: 10px;"><b>Servicio: </b><Service></td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-bottom:5px; padding-top: 15px;"><b>Descripción: </b> </td> </tr> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"><Description></td> </tr> <tr><td align="center" valign="middle" style="padding-bottom:10px; padding-top:10px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"> </td> </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Sucursal: </b><ReportBy></td>  </tr>   <tr><td align="start" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:10px; padding-top:10px;"><div>   <table> <tr><td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px; padding-top: 5px;">Para más información de este ticket, click aquí: <a href="http://localhost:4200/requestDetail/<CodeRequest4>" style="font-size:20px;">  <b><CodeRequest2></b> </a> </td>  </tr>  </tr> <tr><td></td></tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Dirección: </b><Direccion></td>  </tr> <tr> <td align="start" valign="middle" style="font-family:Arial; color:#000000; font-size:14px;"> <b>Razón social: </b> TH DE MEXICO SAPI DE CV </td>  </tr>     <tr> <td  colspan="2">  <br> </td> </tr><tr><td align="center" valign="middle" style="padding-bottom:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28">   </td></tr> </table> </div>  </td> </tr><tr> <td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;">  <br>  </table>  </td> </tr>  </table> <br> <br></body></html>'

                        HTML = HTML.replace("<CodeRequest>", element.codeRequest);
                        HTML = HTML.replace("<CodeRequest2>", element.codeRequest);
                        HTML = HTML.replace("<CodeRequest3>", element.codeRequest);
                        HTML = HTML.replace("<CodeRequest4>", element.codeRequest);
                        HTML = HTML.replace("<SubCategory>", element.subCategory);
                        HTML = HTML.replace("<Service>", element.service);
                        HTML = HTML.replace("<Description>", element.description);
                        HTML = HTML.replace("<ReportBy>", element.reportBy.name);
                        HTML = HTML.replace("<Direccion>", element.reportBy.street + " " + element.reportBy.numExt + " " + element.reportBy.numInt + " " + element.reportBy.suburb + " " + element.reportBy.municipality + " " + element.reportBy.state);

                    return transporter.sendMail({
                        from: '...@...',
                        to: email.textAnalist,
                        cc: email.textCopy,
                        subject: 'Timcket AutoEscalado ' + element.codeRequest +' | '+ element.issueMore.subcategory, // Subject line
                        html: HTML
                      }, function (error, info) {
                        console.log("autoEscalamiento", element.codeRequest)
                        // console.log("enviado a: " + email.textAnalist + " y cc: " + email.textCopy)
                      })

                    return

        })


}
], function (err) {
    console.log(err);
});

          }else {
            return
          }
        }, 8000)
    })
    })
    .catch(err => {
        console.log(err);
        res.json(err).status(500).end();
    });
}

function labor(req, res){
    const tiempo ={tiempo:moment(moment()).format('YYYY-MM-DD')}
    Users.findById('62f1aac722e803510baceebd', {"_id":1, xenialToken:1},(err,reqToken)=>{
                Users.find({type: "local"}, {"_id":1, name:1, xenialId:1},(err,stores)=>{
                    var sitesId=[]
                    var conteo=0

                    // stores=[{_id: "", name: "Ayutla", xenialId: ""}]
                    if(stores.length>=0){
                    stores.forEach(element => {
                        if(element.xenialId){
                            async.waterfall([
                                function step1(next) {
                                    var headers2 = {
                                        headers:{
                                        'Content-Type': 'application/json',
                                        'Authorization': reqToken.xenialToken,
                                        'x-company-id': '',
                                        'x-site-ids': element.xenialId
                                        }
                                    }

                                    // aqui saco la venta total del dia (solo la cantidad de dinero y cantidad de ordenes)
                                    axios.get('{{URL_Xenial}}/api/reporting/calculations?start_business_date='+tiempo.tiempo+'&end_business_date='+tiempo.tiempo, headers2).then(reqAllSale =>{
                                        var reqData={
                                            token: reqToken.xenialToken,
                                            saleTotal: reqAllSale.data.sections.calculations.net_sales // aqui saco la venta total del dia
                                        }
                                        next(null, reqData)
                                    }).catch(err => {
                                        console.log("err en labor step1 ")
                                    })
                                },
                                function step2(reqData, next) {
                                    var headers3 = {
                                        headers:{
                                        'Content-Type': 'application/json',
                                        'Authorization': reqToken.xenialToken,
                                        'x-company-id': '',
                                        'x-site-ids': element.xenialId
                                        }
                                    }

                                    // aqui saco la venta pero por cada hora del dia (solo dinero y cantidad de ordenes)
                                    axios.get('{{URL_Xenial}}/api/reporting/sales-by-time?business_date='+tiempo.tiempo, headers3).then(reqAllSaleXTime =>{
                                        var reqAllSaleXTime= reqAllSaleXTime.data
                                        next(null, reqData, reqAllSaleXTime)
                                    }).catch(err => {
                                        console.log("err en labor step2 ")
                                    })
                                },
                                function step4(reqData, reqAllSaleXTime, next) {

                                    var headers4 = {
                                        headers:{
                                        'Content-Type': 'application/json',
                                        'Authorization': reqToken.xenialToken,
                                        'x-company-id': '',
                                        'x-site-ids': element.xenialId
                                        }
                                    }

                                    // aqui se consulta cuantos empleados estan en labor, cuanto se le esta pagando y horas trabajadas
                                    axios.get('{{URL_Xenial}}/Payroll/PayrollDetail/GetBy?fieldName=BusinessDate&value='+tiempo.tiempo, headers4).then(reqAllLabor =>{
                                        
                                        var arrayRespuesta = reqAllLabor.data.Data
                                        var nuevoArray    = []
                                        var arrayTemporal = []
                                        for(var i=0; i<arrayRespuesta.length; i++){
                                            arrayTemporal = nuevoArray.filter(resp => resp["Nombre"] == arrayRespuesta[i]["EmployeeId"])
                                            if(arrayTemporal.length>0){
                                                nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["Profesionales"].push({_id:arrayRespuesta[i]["EmployeeId"]},{pay:arrayRespuesta[i]["TotalPay"]}, {hours:arrayRespuesta[i]["Hours"]})
                                            }else{
                                                nuevoArray.push({"Nombre" : arrayRespuesta[i]["EmployeeId"] , "Profesionales" : [{_id:arrayRespuesta[i]["EmployeeId"]},{pay:arrayRespuesta[i]["TotalPay"]}, {hours:arrayRespuesta[i]["Hours"]} ]})
                                            }
                                        }
                                nuevoArray.forEach((element, i) => {
                                    var num = 0
                                    var numH = 0
                                    element.Profesionales.forEach((element2,y)=>{
                                        if(element2.pay){
                                            num = num + element2.pay
                                            nuevoArray[i].sum = num
                                        }
                                        if(element2.hours){
                                            numH = numH + element2.hours
                                            nuevoArray[i].sumHour = numH
                                        }
                                    });
                                })
                                console.log("==========================================")
                                const nuevoLabor = nuevoArray
                                var totalPay= 0
                                var totalHours= 0
                                nuevoArray.forEach((element,i)=>{
                                    totalPay = element.sum + totalPay
                                    totalHours = element.sumHour + totalHours
                                })

                                var num=0
                                    num =Number(reqData.saleTotal.total)
                                var laborCostPorcent = ((Number(totalPay)*100)/num).toFixed(2)

                                        var xenialData= {
                                            saleTotal: reqData.saleTotal,
                                            saleXHour: reqAllSaleXTime.sales_data[reqAllSaleXTime.sales_data.length-1],
                                            labor: {
                                                plantillaTotal: nuevoArray.length,
                                                laborCost: Number(totalPay).toFixed(2),
                                                laborHours: totalHours,
                                                labor:Number(laborCostPorcent).toFixed(2),
                                            },
                                            dateUpload: new Date()
                                        }

                                        Users.findByIdAndUpdate(element._id, {xenialData: xenialData}, (err, userUpdated)=>{
                                            if(err){
                                                return
                                            } else{
                                                // console.log("FINISHHHHHHHHHH")
                                                // res.status(200).send({users: nuevoLabor})
                                                nuevoLabor
                                                return
                                            }
                                        })
                                    }).catch(err => {
                                        console.log("err en labor step4 ")
                                    })
                                }
                            ])
                        }else{
                        }
                    })}

                })
            }).catch(err => {
                console.log("err en labor step1 ")
            })

}

function saveUser(req, res){
    if(req.body.department == '') req.body.department = null
    if(req.body.responsable == '') req.body.responsable = null

    var users = new Users(req.body);
        if(req.body.password){
            Users.find({userLog: req.body.userLog},(err,user)=>{
                if(err){
                    res.status(500).send({message: 'Error al guardar el usuario 1'})
                }else{
                    if(user.length>0){
                        res.status(404).send({message: 'Usuario existente, intente con uno nuevo'})
                    }else{
                        Users.find({email: req.body.email},(err,user)=>{
                            if(err){
                                res.status(500).send({message: 'Error al guardar el usuario 2'})
                            }else{
                                if(user.length>0){
                                    res.status(404).send({message: 'Email existente, intente con uno nuevo'})
                                }else{

                                    bcrypt.hash(req.body.password, null, null, function(err, hash){
                                        users.password = hash;
                                        if(users.fname != null && users.lname != null && users.type != null){
                                            // Guardar usuaria
                                            users._id = null
                                            if(!users.area) users.area= undefined
                                            users.save((err, userStored)=>{
                                                if(err){
                                                    res.status(500).send({message: 'Error al guardar el usuario 3'})
                                                } else{
                                                    if(!userStored){
                                                        res.status(404).send({message: 'No se pudo registrar el usuario'})
                                                    } else{
                                                        res.status(200).send({users: userStored})
                                                    }
                                                }
                                            });
                                        } else{
                                            res.status(200).send({message: 'Completa todos los datos'})
                                        }
                                    })
                            
                                }
                            }
                        })
                    }
                }
            })
    } else{
        res.status(200).send({message: 'Introduce la contraseña'})
    }
}

function loginUser(req, res){
    Users.findOne({email: req.body.email.toLowerCase()},(err,user)=>{
        if(err){
            res.status(500).send({message: 'Error en la petición'})
        } else{
            if(!user){
                Users.findOne({userLog: req.body.email},(err,user)=>{
                    if(err){
                        res.status(500).send({message: 'Error en la petición'})
                    } else{
                        if(!user){
                            res.status(404).send({message: 'El usuario no existe'})
                        }else{
                            bcrypt.compare(req.body.password, user.password, function(err, check){
                                if(check){
                                    if(req.body.gethash){
                                        res.status(200).send({token: twt.createToken(user)})
                                    }else{
                                        res.status(200).send({user})
                                    }
                                }else{
                                    res.status(404).send({message: 'Contraseña incorrecta'})
                                }
                            })
                        }
                    }
                }).populate('responsable department')
            } else{
                // comprobar contraseña
                bcrypt.compare(req.body.password, user.password, function(err, check){
                    if(check){
                        if(req.body.gethash){
                            res.status(200).send({token: twt.createToken(user)})
                        }else{
                            res.status(200).send({user})
                        }
                    }else{
                        res.status(404).send({message: 'Contraseña incorrecta'})
                    }
                })
            }
        }
    }).populate('responsable department')
}

function updateUser(req, res){
    Users.findByIdAndUpdate(req.params.id, req.body, (err, userUpdated)=>{
        if(err){
            res.status(500).send({message: 'Error al actualizar'})
        } else{
            if(!userUpdated){
                res.status(404).send({message: 'No se pudo actualizar'})
            } else{
                res.status(200).send({userUpdated})
            }
        }
    })
}

function uploadImage(req, res){
    if(req.files){
        var file_path = req.files.image.path.split(/[\\/.]+/g)
        if(file_path[3] == 'png' || file_path[3] == 'jpg' || file_path[3] == 'jpeg' || file_path[3] == 'gif'){
            Users.findByIdAndUpdate(req.params.id, {image: file_path[2] + "." + file_path[3]},(err, userUpdated) => {
                if(!userUpdated){
                    res.status(404).send({message: 'No se pudo actualizar'})
                } else{
                    res.status(200).send({userUpdated})
                }
            })
        } else{
            res.status(200).send({message: 'Extencion del archivo no valido'})
        }
    } else{
        res.status(200).send({message: 'No has subido ninguna imagen'})
    }
}

function getImage(req, res){
    fs.exists('./uploads/users/' + req.params.image, function(exists){
        if(exists){
            res.sendFile(path.resolve('./uploads/users/' + req.params.image))
        } else{
            res.status(200).send({message: 'No existe la imagen'})
        }
    })
}

function getImageLogo(req, res){
    fs.exists('./uploads/logos/' + req.params.image, function(exists){
        if(exists){
            res.sendFile(path.resolve('./uploads/logos/' + req.params.image))
        } else{
            res.status(200).send({message: 'No existe la imagen'})
        }
    })
}

function changePassword(req, res){
    if(req.body.newPassword){
        bcrypt.hash(req.body.newPassword, null, null, function(err, hash){
            Users.findByIdAndUpdate(req.body.user._id,{password: hash, password2: req.body.newPassword},(err, updatePassword)=>{
                if(err){
                    res.status(500).send({message: 'Error al actualizar'})
                } else{
                    if(!updatePassword){
                        res.status(404).send({message: 'No se pudo actualizar'})
                    } else{
                        res.status(200).send({updatePassword})
                    }
                }
            })
        })
    }else{
        res.status(404).send({message: 'Introduce una contraseña'})
    }
}

function passwordToResume(req, res){
    Users.find({email:req.body.send.toLowerCase()},(err,user)=>{
        if(err){
            res.status(500).send({message: 'Error en la petición'})
        } else{
            if(user.length < 1){
                // aqui voy a tener que hacer la busqueda por usuario ahora
                Users.find({userLog :req.body.send},(err,user)=>{
                    if(err){
                        res.status(500).send({message: 'Error en la petición'})
                    } else{
                        if(user.length < 1){
                            res.status(404).send({message: 'El usuario no existe'})
                        }else{
                            var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>Cambiar Contraseña</title></head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td><table width="84" border="0" cellspacing="0" cellpadding="0"><tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"><div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div></td></tr></table></td></tr><tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"><tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;">Tim Hortons</td></tr><tr><td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 8%;"><p>Timckets</i></td></tr></table></td></tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="center" valign="middle" style="font-family:Arial; color:#000000; font-size:24px; padding-bottom:5px;"><p>Ha solicitado restablecer su contraseña</i><tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="center" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:15px; padding-top:15px;"><div><table><tr><td align="center" style="font-family:Arial; font-weight: bold;"><br><a style="color: #c90d0de3;" href="https://soporte.timhortonsmx.com/changePassword/<CodeRequest>"><b>CLICK AQUÍ PARA CAMBIAR SU CONTRASEÑA.</b></a></td></tr></tr><tr><td  colspan="2"><br></td></tr></table></div></td></tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;"><br></table></div></td></tr></table></td></tr></table><br><br></body></html>'
                            // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>Cambiar Contraseña</title></head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td><table width="84" border="0" cellspacing="0" cellpadding="0"><tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"><div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div></td></tr></table></td></tr><tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"><tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;">Tim Hortons</td></tr><tr><td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 8%;"><p>Timckets</i></td></tr></table></td></tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="center" valign="middle" style="font-family:Arial; color:#000000; font-size:24px; padding-bottom:5px;"><p>Ha solicitado restablecer su contraseña</i><tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="center" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:15px; padding-top:15px;"><div><table><tr><td align="center" style="font-family:Arial; font-weight: bold;"><br><a style="color: #c90d0de3;" href="http://localhost:4200/changePassword/<CodeRequest>"><b>CLICK AQUÍ PARA CAMBIAR SU CONTRASEÑA.</b></a></td></tr></tr><tr><td  colspan="2"><br></td></tr></table></div></td></tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;"><br></table></div></td></tr></table></td></tr></table><br><br></body></html>'
                            
                            HTML = HTML.replace("<CodeRequest>", user[0]._id);

                            return transporter.sendMail({
                                from: '...@...',
                                to: user[0].email + ';',
                                subject: 'Cambio de contraseña de timckets.', // Subject line
                                html: HTML
                              }, function (error, info) {
                                res.status(200).send({message: 'Correo enviado a: ' + user[0].email})
                                if (error) {
                                  console.log(error);
                                }
                              });
                        }
                    }
                })
            } else{
                var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>Cambiar Contraseña</title></head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td><table width="84" border="0" cellspacing="0" cellpadding="0"><tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"><div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div></td></tr></table></td></tr><tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"><tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;">Tim Hortons</td></tr><tr><td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 8%;"><p>Timckets</i></td></tr></table></td></tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="center" valign="middle" style="font-family:Arial; color:#000000; font-size:24px; padding-bottom:5px;"><p>Ha solicitado restablecer su contraseña</i><tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="center" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:15px; padding-top:15px;"><div><table><tr><td align="center" style="font-family:Arial; font-weight: bold;"><br><a style="color: #c90d0de3;" href="https://soporte.timhortonsmx.com/changePassword/<CodeRequest>"><b>CLICK AQUÍ PARA CAMBIAR SU CONTRASEÑA.</b></a></td></tr></tr><tr><td  colspan="2"><br></td></tr></table></div></td></tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;"><br></table></div></td></tr></table></td></tr></table><br><br></body></html>'
                // var HTML = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>Cambiar Contraseña</title></head><body><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" bgcolor="#CB1717" style="background-color:#c90d0de3;"><br><br><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" valign="top" style="padding-left:13px; padding-right:13px; background-color:#ffffff;"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td><table width="84" border="0" cellspacing="0" cellpadding="0"><tr><td height="80" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial, Helvetica, sans-serif; color:#ffffff;"><div style="font-size:15px;"><img width="80" height="80" src="https://dev-soporte.timhortonsmx.com/img/logo-short.jpeg"></img></div></td></tr></table></td></tr><tr><td align="center" valign="middle" style="padding-top:7px;"><table width="240" border="0" cellspacing="0" cellpadding="0"><tr><td height="31" align="center" valign="middle" bgcolor="#CB1717" style="font-family:Arial; font-size:19px; color:#ffffff;">Tim Hortons</td></tr><tr><td align="center" valign="middle" style="font-family:Arial; font-size:35px; padding-top: 8%;"><p>Timckets</i></td></tr></table></td></tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="center" valign="middle" style="font-family:Arial; color:#000000; font-size:24px; padding-bottom:5px;"><p>Ha solicitado restablecer su contraseña</i><tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="center" valign="middle" style="font-family:Arial; font-weight: bold; padding-bottom:15px; padding-top:15px;"><div><table><tr><td align="center" style="font-family:Arial; font-weight: bold;"><br><a style="color: #c90d0de3;" href="http://localhost:4200/changePassword/<CodeRequest>"><b>CLICK AQUÍ PARA CAMBIAR SU CONTRASEÑA.</b></a></td></tr></tr><tr><td  colspan="2"><br></td></tr></table></div></td></tr><tr><td align="center" valign="middle" style="padding-bottom:15px; padding-top:15px;"><img src="https://dev-soporte.timhortonsmx.com/img/divider.gif" width="573" height="28"></td></tr><tr><td align="left" valign="middle" style="font-family:Arial; font-size:12px; color:#000000;"><br></table></div></td></tr></table></td></tr></table><br><br></body></html>'

                HTML = HTML.replace("<CodeRequest>", user[0]._id);

                // aqui se le enviara un correo al usuario
                return transporter.sendMail({
                    from: '...@...',
                    to: user[0].email + ';',
                    subject: 'Cambio de contraseña de timckets.', // Subject line
                    html: HTML
                  }, function (error, info) {
                    res.status(200).send({message: 'Correo enviado a: ' + user[0].email})
                    if (error) {
                      console.log(error);
                    }
                  });
            }
        }
    })
}
 
function usersAdmin(req, res){
    Users.find({type:{$ne:"local"}},(err, requests)=>{
            res.status(200).send(requests)
        }).populate('department').sort({"department":1, "fname":1})

}

function allAreasOnly(req, res){
    Areas.find({},(err, requests)=>{
        res.status(200).send(requests)
    }).sort("name")
}

function getLocals(req, res){
    Users.find({type: "local"},(err, requests)=>{
        res.status(200).send(requests)
    }).populate('area').sort("name")
}

function getLocalsXLabor(req, res){
    var fecha = new Date();
    var hoy = fecha.getDate();
    var month = fecha.getMonth();
    var ano = fecha.getFullYear();
    var dia = new Date(ano, month, hoy)

    Users.find(
        {
            type: "local",
            xenialId:{$exists: true},
            xenialData:{$exists: true},
            "xenialData.dateUpload":{$gte: dia}
        }
        ,(err, requests)=>{
        res.status(200).send(requests)
    }).sort({"xenialData.labor.labor":-1})
}

function oneUser(req, res){
    Users.find({_id: req.body.request},(err, requests)=>{
        res.status(200).send(requests)
    })
}

function getMoment(req, res){
    var tiempo ={tiempo:moment(moment()).tz('America/Monterrey').format('YYYY-MM-DD')}
    res.status(200).send(tiempo)
}

function getTime(req, res){
    var tiempo ={tiempo:moment().tz('America/Monterrey').format('HH'), dia: moment().tz('America/Monterrey').format('dd')}
    res.status(200).send(tiempo)
}

function editLocal(req, res){
    Users.findByIdAndUpdate(req.body._id,{name: req.body.name, area: req.body.area, phone: req.body.phone, street: req.body.street, numExt: req.body.numExt, numInt: req.body.numInt, suburb: req.body.suburb, municipality: req.body.municipality, state: req.body.state, postalCode: req.body.postalCode, userLog: req.body.userLog, xenialId: req.body.xenialId, rbiNumber: req.body.rbiNumber},(err, requests)=>{
        res.status(200).send(requests)
    })
}


function editVentaRequerida(req, res){
    req.body.forEach((element, i)=>{
        Users.findOneAndUpdate({rbiNumber: element.rbi_store},{ventaRequerida: element.ventaRequerida},(err, requests)=>{
        })
    })
    res.status(200).send({message:"exito"})
}

function getFilter(req, res){
    var tiempo1= moment(req.body.request.tiempo1).tz('America/Monterrey');
    tiempo1= tiempo1.toDate()

    var tiempo2= moment(req.body.request.tiempo2).tz('America/Monterrey');
    tiempo2= tiempo2.toDate()

    var hora= moment().tz('America/Monterrey')
    var fechaMenosDosHoras = hora.subtract(2, 'hours');
    const horaAtras= new Date(fechaMenosDosHoras)

    if(req.body.request.filtro=="hoy"){
        OrdersDay.aggregate([
            {
                $lookup: {
                  from: "users",
                  localField: "users",
                  foreignField: "_id",
                  as: "users"
                }
              },
              {
                $unwind: {
                  path: "$users",
                  preserveNullAndEmptyArrays: true
                },
              },
              {
                $lookup: {
                  from: "areas",
                  localField: "users.area",
                  foreignField: "_id",
                  as: "usersArea"
                }
              },
              {
                $unwind: {
                  path: "$usersArea",
                  preserveNullAndEmptyArrays: true
                },
              },
            {
                $match: {
                    $and:[
                        {'durationSeconds': {$exists: true}},
                        {'first_item_added':{$gte: tiempo1 , $lte: tiempo2}},
                        {'net_sales':{$gt: 0}}
                    ]
                }
            },
            {
                $group: {
                    _id: "$users._id",
                    usersName:{ $first: "$usersName" },
                    usersArea:{ $first: "$usersArea.name"},
                    cantidadOrdenes: { $sum: 1},
                    durationSeconds: { $sum: '$durationSeconds'},
                    firstHour: {$last: "$first_item_added"},
                    lastHour: {$first: "$first_item_added"},
                }
            }
        ]).allowDiskUse(true).exec()
    .then(arreglo1 => {
        OrdersDay.aggregate([

            {
                $match: {
                    $and:[
                        {'durationSeconds': {$exists: true}},
                        {'first_item_added':{$gte: horaAtras}},
                        {'net_sales':{$gt: 0}}
                    ]
                } 
            },
            {
                $group: {
                    _id: "$users",
                    usersName:{ $first: "$usersName" },
                    cantidadOrdenesHora: { $sum: 1},
                    durationSecondsHora: { $sum: '$durationSeconds'}
                }
            }
        ]).allowDiskUse(true).exec()
    .then(arreglo2 => {
    
        if(arreglo2.length>0){
            function combinarCampos(arreglo1, arreglo2) {
                // Crear un objeto para almacenar los objetos con el campo _id como clave
                const objetosCombinados = {};          
                // Agregar los objetos del arreglo1 al objeto combinado
                arreglo1.forEach(item => {
                  objetosCombinados[item._id] = { _id: item._id, ...item };
                });
                // Agregar los objetos del arreglo2 al objeto combinado
                arreglo2.forEach(item => {
                  if (objetosCombinados[item._id]) {
                    // Si el objeto ya existe en objetosCombinados, combinar los campos
                    objetosCombinados[item._id] = { ...objetosCombinados[item._id], ...item };
                  } else {
                    // Si el objeto no existe en objetosCombinados, agregarlo tal cual
                    objetosCombinados[item._id] = item;
                  }
                });
                // Obtener el arreglo combinado a partir del objeto combinado
                const resultadoFinal = Object.values(objetosCombinados);
                return resultadoFinal;
              }
              const resultadoFinal = combinarCampos(arreglo1, arreglo2);
        
                  res.status(200).send(resultadoFinal)
    
        }else{
            res.status(200).send(arreglo1)
        }
    })

    })
    }else{
        Orders.aggregate([
            {
                $lookup: {
                  from: "users",
                  localField: "users",
                  foreignField: "_id",
                  as: "users"
                }
              },
              {
                $unwind: {
                  path: "$users",
                  preserveNullAndEmptyArrays: true
                },
              },
              {
                $lookup: {
                  from: "areas",
                  localField: "users.area",
                  foreignField: "_id",
                  as: "usersArea"
                }
              },
              {
                $unwind: {
                  path: "$usersArea",
                  preserveNullAndEmptyArrays: true
                },
              },
            {
                $match: {
                    $and:[
                        {'durationSeconds': {$exists: true}},
                        {'first_item_added':{$gte: tiempo1 , $lte: tiempo2}},
                        {'net_sales':{$gt: 0}}
                    ]
                }
            },
            {
                $group: {
                    _id: "$users._id",
                    usersName:{ $first: "$usersName" },
                    usersArea:{ $first: "$usersArea.name"},
                    cantidadOrdenes: { $sum: 1},
                    durationSeconds: { $sum: '$durationSeconds'},
                    firstHour: {$last: "$first_item_added"},
                    lastHour: {$first: "$first_item_added"},
                }
            }
        ]).allowDiskUse(true).exec()
    .then(requests2 => {
        res.status(200).send(requests2)
    })
    }
}

function getSpeedOfService(req, res){

    var hora= moment().tz('America/Monterrey')
    var fechaMenosDosHoras = hora.subtract(2, 'hours');
    const horaAtras= new Date(fechaMenosDosHoras)

    OrdersDay.aggregate([
        {
            $match: {
                $and:[
                    {'durationSeconds': {$exists: true}},
                    {'net_sales':{$gt: 0}}
                ]
            }
        },
        {
            $lookup: {
              from: "users",
              localField: "users",
              foreignField: "_id",
              as: "users"
            }
          },
          {
            $unwind: {
              path: "$users",
              preserveNullAndEmptyArrays: true
            },
          },
          {
            $lookup: {
              from: "areas",
              localField: "users.area",
              foreignField: "_id",
              as: "usersArea"
            }
          },
          {
            $unwind: {
              path: "$usersArea",
              preserveNullAndEmptyArrays: true
            },
          },
        {
            $group: {
                _id: "$users._id",
                usersName:{ $first: "$usersName" },
                usersArea:{ $first: "$usersArea.name"},
                cantidadOrdenes: { $sum: 1},
                durationSeconds: { $sum: '$durationSeconds'},
                firstHour: {$last: "$first_item_added"},
                lastHour: {$first: "$first_item_added"},
            }
        }
    ]).allowDiskUse(true).exec()
.then(arreglo1 => {

    OrdersDay.aggregate([
        {
            $match: {
                    $and:[
                        {'durationSeconds': {$exists: true}},
                        {'first_item_added':{$gte: horaAtras}},
                        {'net_sales':{$gt: 0}}
                    ]
            } 
        },
        {
            $group: {
                _id: "$users",
                usersName:{ $first: "$usersName" },
                cantidadOrdenesHora: { $sum: 1},
                durationSecondsHora: { $sum: '$durationSeconds'}
            }
        }
    ]).allowDiskUse(true).exec()
.then(arreglo2 => {

    if(arreglo2.length>0){
        function combinarCampos(arreglo1, arreglo2) {
            // Crear un objeto para almacenar los objetos con el campo _id como clave
            const objetosCombinados = {};          
            // Agregar los objetos del arreglo1 al objeto combinado
            arreglo1.forEach(item => {
              objetosCombinados[item._id] = { _id: item._id, ...item };
            });
            // Agregar los objetos del arreglo2 al objeto combinado
            arreglo2.forEach(item => {
              if (objetosCombinados[item._id]) {
                // Si el objeto ya existe en objetosCombinados, combinar los campos
                objetosCombinados[item._id] = { ...objetosCombinados[item._id], ...item };
              } else {
                // Si el objeto no existe en objetosCombinados, agregarlo tal cual
                objetosCombinados[item._id] = item;
              }
            });
            // Obtener el arreglo combinado a partir del objeto combinado
            const resultadoFinal = Object.values(objetosCombinados);
            return resultadoFinal;
          }
          const resultadoFinal = combinarCampos(arreglo1, arreglo2);
    
              res.status(200).send(resultadoFinal)

    }else{
        res.status(200).send(arreglo1)
    }
})
})
}

function extra(req, res){

    
//     Requests.find(
//         {
//             esperaRespuesta: true
//         },
//         (err, requests)=>{

//             requests.forEach((element1, index2)=>{

//                         Requests.findByIdAndUpdate(element1._id, {esperaRespuesta: false},(err, requests)=>{
//                         console.log("FINISH---------------")
//                         return
//                     }).catch(err => {
//                         console.log("err en el esperaRespuesta")
//                         return
//                     })

//                     })
//                     console.log("okokok")
//     }).populate('reportBy issue').populate('analyst issueMore')

// setTimeout(()=>{



//     Requests.find(
//         {
//             $and:[
//                 {'status': {$ne:'Solucionado'}},
//                 {'status': {$ne:'SolucionadoPreventivo'}},
//                 {'status': {$ne:'AutoSolucionado'}},
//                 {'statusCallCenter': {$ne:'SolucionadoCallCenter'}},
//                 {'statusCallCenter': {$ne:'SolucionadoPreventivoCallCenter'}},
//                 {'statusCallCenter': {$ne:'AutoSolucionado'}},
//                 {'notes.0': {$exists: true}}
//             ],
//         },
//         (err, requests)=>{
//             var newReq =[]
//             var cont = 0
//             requests.forEach((element1, index1)=>{
//                 if(element1.notes[element1.notes.length-1].esperaRespuesta==true){
//                     newReq.push(element1)
//                     cont++
//                 }else{
//                     cont++
//                 }
//             })
//             setTimeout(()=>{
//                 if(requests.length == cont){

//                     newReq.forEach((element2, index2)=>{

//                         Requests.findByIdAndUpdate(element2._id, {esperaRespuesta: true},(err, requests)=>{
//                         console.log("FINISH---------------")
//                         return
//                     }).catch(err => {
//                         console.log("err en el esperaRespuesta")
//                         return
//                     })

//                     })
//                     console.log("okokok")
//                 }
//             },15000)
//     }).populate('reportBy issue').populate('analyst issueMore')

// },20000)



// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------






    // Orders.aggregate([
    //     {
    //         $match: {
    //             $and: [
    //                 { 'first_item_added': { $gte: new Date('2023-04-01T06:00:00.000Z') } },
    //                 { 'first_item_added': { $lte: new Date('2023-04-10T06:00:00.000Z') } }
    //             ]
    //         },
    //     },
    // ]).allowDiskUse(true).exec()
    // .then(arreglo => {

    // arreglo.forEach((element, index)=>{

    //     async.waterfall([
    //         function step1(next) {
    //             if(element.first_item_added){
    //                 var start =moment(element.first_item_added).tz('America/Monterrey')
    //                 if(element.kitchen_sent && element.kitchen_sent != null){
    //                     var bomp =moment(element.kitchen_sent).tz('America/Monterrey')
    //                     var duration2 = moment.duration(bomp.diff(start));  // dif en segundos por tomar orden
    //                     element.orderTakingTime= duration2.asSeconds()
    //                     next(null, element)
    //                 }else{
    //                     // no tendran orderTakingTime
    //                     return
    //                 }
    //             }else{
    //                 // no tendran orderTakingTime
    //                 return
    //             }
    //         },

    //         function step2(arreglo, next) {

    //             if(element.orderTakingTime){
    //                 Orders.findByIdAndUpdate(element._id, {orderTakingTime: element.orderTakingTime},(err, requests)=>{
    //                     console.log("FINISH---------------")
    //                     return
    //                 }).catch(err => {
    //                     console.log("err en update para orderTakingTime")
    //                     return
    //                 })
    //             }else{
    //                 console.log(element._id, "eeeeeeeeeeeeeeeeeeeeee")
    //                 return
    //             }
    //         },
    //         ], function (err) {
    //             return
    //             console.log(err);
    //         });

    // })


    // })



// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------


    // Orders.deleteMany(
    //     {
    //         'date':{$gte: '2023-12-30T05:00:00.000+00:00'}
    //     },(err, requests1)=>{
    //         console.log("FINISHHHH")
    // })



}

module.exports = {
    extra,
    prueba,
    laborSetInterval,
    labor,
    laborXHora,
    laborDay,
    speedOfService,
    autoEscalamiento,
    getLocalsXLabor,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImage,
    getImageLogo,
    changePassword,
    passwordToResume,
    usersAdmin,
    getLocals,
    oneUser,
    getMoment,
    getTime,
    allAreasOnly,
    editLocal,
    editVentaRequerida,
    orders,
    tokenXenial,
    autoClosed,
    getFilter,
    getSpeedOfService,
    ordersDay,
    getAccessToken,
    autoCompleteIssues,
    autoCodeRequestDuplicate,
}