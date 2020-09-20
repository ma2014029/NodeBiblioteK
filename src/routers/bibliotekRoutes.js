'use strict'

var express = require("express")
var bibliotekController = require("../controllers/bibliotekController")
var md_auth = require("../middlewares/authenticated");
var api = express.Router();


api.post('/Login-Bibliotek', bibliotekController.central)
api.post('/Bibliotek', md_auth.ensureAuth, bibliotekController.central)
api.post('/Bibliotek-BulkLoadOfBooks', md_auth.ensureAuth, bibliotekController.BulkLoadOfBooks)


module.exports = api;