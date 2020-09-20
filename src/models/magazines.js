'use strict'
var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var MagazineSchema = Schema({
    author: String,
    title: String,
    edition: String,            //# de edicion del libro
    description: String,
    publicationFrequency: String, //Frecuencia Actual con la que se publica la revista (trimestral...)
    specimens: Number,          //Guarda el número de ejemplar publicado hasta la fecha
    themes: [],          //temas importantes del libro
    keywords: [],       //serie de palabras clave del libro
    copies: Number,             //# de existencia que tiene el libro
    available: Number,          //# de copias disponibles para prestar
    search_counterM: Number,
    loan_accountantM: Number,
    
})

module.exports = mongoose.model('magazine', MagazineSchema);
