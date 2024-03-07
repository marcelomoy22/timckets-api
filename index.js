'use strict'

var mongoose = require('mongoose');
var app = require('./app');
const cron = require('node-cron');
var orders = require('./controllers/users')

    // Aqui borre los puertos que utilizo de producción y deje solo del localhost
    const port = process.env.PORT || 3977;   // localhost 

mongoose.Promise = global.Promise;

// Aqui borre la coneccion a la base de datos de producción por temas de contraseñas y deje la de local
mongoose.connect('mongodb://localhost:27017/timckets',(err, res)=>{
    if(err){
        throw err;
    } else {
        console.log(" - Conexión corriendo correctamente...")

        app.listen(port, function(){
            console.log(" - Servidor escuchando en puerto " + port)
        })
    }
})

// tarea para que se ejecute a las 6:30 AM todos los días (hora de Monterrey)
cron.schedule('30 7 * * *', () => {
    if(port==3933){
        orders.orders();
    }
}, {
    scheduled: true,
    timezone: 'America/Monterrey'
});

// tarea para que se ejecute a las 6:30 AM todos los días (hora de Monterrey)
cron.schedule('30 6 * * *', () => {
    if(port==3933){
        orders.laborXHora();
    }
}, {
    scheduled: true,
    timezone: 'America/Monterrey'
});

// tarea para que se ejecute a las 6:30 AM todos los días (hora de Monterrey)
cron.schedule('30 6 * * *', () => {
    if(port==3933){
        orders.laborDay();
    }
}, {
    scheduled: true,
    timezone: 'America/Monterrey'
});

// tarea para que se ejecute cada 7 minutos
cron.schedule('1-59/7 * * * *', () => {
    if(port==3933){
        orders.labor();
    }
}, {
    scheduled: true,
    timezone: 'America/Monterrey'
});

// tarea para que se ejecute cada 9 minutos
cron.schedule('1-59/9 * * * *', () => {
    if(port==3933){
        orders.ordersDay();
    }
}, {
    scheduled: true,
    timezone: 'America/Monterrey'
});

// tarea para que se ejecute cada 11 minutos
cron.schedule('1-59/11 * * * *', () => {
    if(port==3933){
        orders.autoEscalamiento();
    }
}, {
    scheduled: true,
    timezone: 'America/Monterrey'
});

// tarea para que se ejecute cada 14 minutos
cron.schedule('1-59/14 * * * *', () => {
    if(port==3933){
        orders.autoCompleteIssues();
    }
}, {
    scheduled: true,
    timezone: 'America/Monterrey'
});

// tarea para que se ejecute cada 19 minutos
cron.schedule('1-59/19 * * * *', () => {
    if(port==3933){
        orders.autoCodeRequestDuplicate();
    }
}, {
    scheduled: true,
    timezone: 'America/Monterrey'
});

// tarea para que se ejecute cada 56 minutos
cron.schedule('1-59/56 * * * *', () => {
    if(port==3933){
        orders.autoClosed();
    }
}, {
    scheduled: true,
    timezone: 'America/Monterrey'
});


// tarea para que se ejecute cada 55 minutos
cron.schedule('1-59/55 * * * *', () => {
    if(port==3933){
        orders.getAccessToken();
    }
}, {
    scheduled: true,
    timezone: 'America/Monterrey'
});
