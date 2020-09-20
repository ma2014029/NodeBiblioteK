'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var UserSchema = Schema({
    carnet: Number,
    cui: Number,          //solo si es catedrático
    nombre: String,
    apellido: String,
    rol: String,          //admin, estudiante, catedrático
    password : String,
    numberOfLoans: Number,
    LoansB:[
        {type: Schema.ObjectId, ref: 'book'}
    ],
    LoanHistoryB:[
        {type: Schema.ObjectId, ref: 'book'}
    ],
    LoansM:[
        {type: Schema.ObjectId, ref: 'magazine'},
    ],
    LoanHistoryM:[
        {type: Schema.ObjectId, ref: 'magazine'}
    ],
})

module.exports = mongoose.model('user', UserSchema);
