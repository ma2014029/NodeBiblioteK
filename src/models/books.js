 'use strict'
var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var BookSchema = Schema({
    author: String,
    title: String,
    edition: String,            //# de edicion del libro
    description: String,        //una breve descripcion 
    copies: Number,             //# copias de existencia que tiene el libro
    available: Number,          //# de copias disponibles para prestar
    search_counterB: Number,
    loan_accountantB: Number,
    keywords: [],         //serie de palabras clave del libro
    themes: [],           //temas importantes del libro
})

module.exports = mongoose.model('book', BookSchema);
