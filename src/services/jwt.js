'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'clave_secreta_2014029' 

exports.createToken = function (user){

    var payload = {
        sub: user._id,
        carnet: user.carnet,
        cui: user.cui,          //solo si es catedrático
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,          //admin, estudiante, catedrático
        password : user.password,
        iat: moment().unix(),
        exp: moment().day(15, 'days').unix()
    }
    return jwt.encode(payload, secret)
}