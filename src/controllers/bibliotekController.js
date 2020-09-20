'use strict'
//Imports
var bcrypt = require('bcrypt-nodejs')
var Book = require('../models/books')
var jwt= require('../services/jwt')
var Magazine = require('../models/magazines')
var md_auth = require("../middlewares/authenticated")
var User = require('../models/users')


const userMaster = {
    nombre: 'admin',
    rol: 'admin',
    password: 'admin',
}
var master = new User(userMaster);

bcrypt.hash(userMaster.password, null, null,(err, hash)=>{
    master.password = hash;}
);
    master.save();

function central(req, res){
    var user = new User();
    var book = new Book();
    var magazine = new Magazine();
    var cadReq = req.body.commands;
    var params = cadReq.split('/');
    var option = params[0].toLowerCase();

    switch (option) {

        case 'login':
            User.findOne({nombre: params[1]}, (err, searchUser)=>{
                if(err) return res.status(500).send({message: 'usuario no encontrado'}) 
                if(searchUser){
                    bcrypt.compare(params[2], searchUser.password, (err, check)=>{
                        if(err) return res.status(500).send({message: 'Los datos no coinciden'})
                        if(check){
                            if(params[3]){
                                return res.status(200).send({
                                    token: jwt.createToken(searchUser)
                                })
                            }else{
                                searchUser.password = undefined;
                                return res.status(404).send({user: searchUser})
                            }
                        }else{
                            return res.status(404).send({message: 'La verificacion del usuario ha sido erronea'})
                        }    
                    })
                }else{
                    return res.status(404).send({message: 'El usuario no se ha podido logear'})
                }
            })
            break;

        //Administrator functions
        case 'create_user':
            if("admin" == req.user.rol){
                var e = params[4].toLowerCase();
                if("estudiante" == e){
                    if(params[1]){
                        user.carnet = params[1];
                        user.nombre = params[2];
                        user.apellido = params[3];
                        user.rol = params[4];
                        user.password = params[5];
                        user.numberOfLoans = 0;

                        User.find({ $or: [
                            {carnet: user.carnet},
                        ]}).exec((err, userFind)=>{
                            if(err) return res.status(500).send({message: 'Error en la peticion'})
                            if(userFind && userFind.length >=1){
                                return res.status(500).send({message: 'Usted ya fue registrado'})
                            }else{
                                bcrypt.hash(params[5], null, null, (err, hash)=>{
                                    user.password = hash;
                                    user.save((err, addedUser)=>{
                                        if(err) return res.status(500).send({message: 'Error al agregar usuario'})
                                        if(!addedUser) return res.status(404).send({message: 'NO se ha podido agregar usuario'})
                                        return res.status(200).send({Add: addedUser})
                                    })
                                })
                            }
                        })
                    }else{
                        return res.status(404).send({message: 'Ingrese su Carnet...'})
                    }
                }
                if("catedratico" == e){
                    if(params[1]){
                        user.cui = params[1];
                        user.nombre = params[2];
                        user.apellido = params[3];
                        user.rol = params[4];
                        user.password = params[5];
                        user.numberOfLoans = 0;

                        User.find({ $or: [
                            {cui: user.cui},
                        ]}).exec((err, userFind)=>{
                            if(err) return res.status(500).send({message: 'Error en la peticion'})
                            if(userFind && userFind.length >=1){
                                return res.status(500).send({message: 'Usted ya fue registrado'})
                            }else{
                                bcrypt.hash(params[5], null, null, (err, hash)=>{
                                    user.password = hash;
                                    user.save((err, addedUser)=>{
                                        if(err) return res.status(500).send({message: 'Error al agregar usuario'})
                                        if(!addedUser) return res.status(404).send({message: 'NO se ha podido agregar usuario'})
                                        return res.status(200).send({Add: addedUser})
                                    })
                                })
                            }
                        })
                    }else{
                        return res.status(404).send({message: 'Ingrese su CUI...'})
                    }
                }
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }
            break;
            
        case 'delete_user':
            if("admin" == req.user.rol){
                User.findById(params[1], (err, findUser)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!findUser) return res.status(404).send({message: 'No se ha podido encontrar el usuario'})
                    findUser.remove((err, delUser)=>{
                        if (err) return res.status(500).send({message: 'Error en la peticion Eliminar'}) 
                        return res.status(200).send({Delete: delUser})
                    })
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }
            break;
        
        case 'update_user': //Debe ingresar todos los datos (los que se quieran actualizar y los que no).
            if("admin" == req.user.rol){
                User.findById(params[1], (err, searchUser)=>{
                    bcrypt.hash(params[6], null, null, (err, hash)=>{
                       var pass = hash;

                        if('estudiante' == searchUser.rol){
                            
                            User.findByIdAndUpdate(params[1], {carnet: params[2], nombre: params[3], apellido: params[4], 
                                rol: params[5], password: pass}, {new: true}, (err, updUser)=>{
                                if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                                if(!updUser) return res.status(404).send({message: 'No se ha podido editar los datos del estudiante'})          
                                return res.status(200).send({Update: updUser})
                            })
                        }
                        if('catedratico' == searchUser.rol){
                            User.findByIdAndUpdate(params[1], {cui: params[2], nombre: params[3], apellido: params[4], 
                                rol: params[5], password: pass}, {new: true}, (err, updUser)=>{
                                if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                                if(!updUser) return res.status(404).send({message: 'No se ha podido editar los datos del catedrático'})          
                                return res.status(200).send({Update: updUser})
                            })
                        }
                    })
                })
                
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }
            break;
            
        case 'view_users': //usar exec 
            if("admin" == req.user.rol){
                User.find((err, searchUser)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!searchUser) return res.status(404).send({message: 'No se ha podido Mostrar'})
                    return res.status(200).send({View: searchUser})
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }
            break;
        
        case 'ordered_users':
            var opcion = params[1].toLowerCase();
            var order =  params[2].toLowerCase();
            if('id' == opcion){
                if('ascendente' == order || 'asc' == order){
                    User.find().sort({_id: 1}).exec(function(err, orderedUsers){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedUsers) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedUsers})
                    })
                }else if('descendente' == order || 'desc' == order){
                    User.find().sort({_id: -1}).exec(function(err, orderedUsers){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedUsers) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedUsers})
                    })
                }
            }else if('apellido' == opcion){
                if('ascendente' == order || 'asc' == order){
                    User.find().sort({apellido: 1}).exec(function(err, orderedUsers){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedUsers) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedUsers})
                    })
                }else if('descendente' == order || 'desc' == order){
                    User.find().sort({apellido: -1}).exec(function(err, orderedUsers){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedUsers) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedUsers})
                    })
                }
            }else if('rol' == opcion){
                if('ascendente' == order || 'asc' == order){
                    User.find().sort({rol: 1}).exec(function(err, orderedUsers){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedUsers) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedUsers})
                    })
                }else if('descendente' == order || 'desc' == order){
                    User.find().sort({rol: -1}).exec(function(err, orderedUsers){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedUsers) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedUsers})
                    })
                }
            }else{
                return res.status(500).send({message: 'Rellene los campos...'})
            }
            break;

        case 'create_book': //carga individual
            if("admin" == req.user.rol){
                if(params[1] && params[2] && params[3], params[4] &&
                    params[5] && params[6] && params[7]){
                    var cadKey = params[4];
                    var container = cadKey.split(','); 
                    var cadKey1 = params[6];
                    var container1 = cadKey1.split(',');  
                   book.author = params[1];
                   book.title = params[2];
                   book.edition = params[3];
                   book.keywords = container;
                   book.description = params[5];
                   book.themes = container1;
                   book.copies = params[7];
                   book.available = params[7];
                   book.search_counterB = 0;
                   book.loan_accountantB = 0;
                    
                   Book.find({ $or: [
                       {title: book.title}
                   ]}).exec((err, books)=>{
                        if(err) return res.status(500).send({message: 'Error en la peticion'})
                        if(books && books.length >=1){
                            return res.status(500).send({message: 'El libro ya fue registrado'})
                        }else{
                            book.save((err, addedBook)=>{
                                if(err) return res.status(500).send({message: 'Error al guardar'})
                                if(!addedBook) return res.status(404).send({message: 'No se ha podido guardar el Libro'})
                                return res.status(200).send({Add: addedBook})
                            })
                        }
                   })
                }else{
                    return res.status(200).send({message: 'Rellene los campos necesarios'})
                }
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            } 
            break;

        case 'delete_book':
            if("admin" == req.user.rol){
                Book.findById(params[1], (err, findBook)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!findBook) return res.status(404).send({message: 'No se ha podido encontrar el usuario'})
                    findBook.remove((err, delBook)=>{
                        if (err) return res.status(500).send({message: 'Error en la peticion Eliminar'}) 
                        return res.status(200).send({Delete: delBook})
                    })
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }
            break;

        case 'update_book':
            if("admin" == req.user.rol){
                    var cadKey = params[5];
                    var container = cadKey.split(','); 
                    var cadKey1 = params[7];
                    var container1 = cadKey1.split(',');  
                Book.findByIdAndUpdate(params[1], {author: params[2], title: params[3], edition: params[4], 
                    keywords: container, description: params[6], themes: container1,
                    copies: params[8], available: params[9]}, {new: true}, (err, updBook)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!updBook) return res.status(404).send({message: 'No se ha podido editar los datos del libro'})          
                    return res.status(200).send({Update: updBook})
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }

            break;

        case 'view_books':
            if("admin" == req.user.rol){
                Book.find((err, searchBook)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!searchBook) return res.status(404).send({message: 'No se ha podido Mostrar'})
                    return res.status(200).send({View: searchBook})
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            } 
            break;

        case 'create_magazine':
            if("admin" == req.user.rol){
                if(params[1] && params[2] && params[3], params[4] &&
                    params[5] && params[6] && params[7] && params[8] 
                    && params[9]){
                    var cadThem = params[7];
                    var container1 = cadThem.split(','); 
                    var cadKey = params[8];
                    var container = cadKey.split(','); 
                   magazine.author = params[1];
                   magazine.title = params[2];
                   magazine.edition = params[3];
                   magazine.description = params[4];
                   magazine.publicationFrequency = params[5];
                   magazine.specimens = params[6]
                   magazine.themes = container1;
                   magazine.keywords = container;
                   magazine.copies = params[9];
                   magazine.available = params[9];
                   magazine.search_counterM = 0;
                   magazine.loan_accountantM = 0;
                    
                   Magazine.find({ $or: [
                       {title: magazine.title}
                   ]}).exec((err, magazines)=>{
                        if(err) return res.status(500).send({message: 'Error en la peticion'})
                        if(magazines && magazines.length >=1){
                            return res.status(500).send({message: 'El libro ya fue registrado'})
                        }else{
                            magazine.save((err, addedMagazine)=>{
                                if(err) return res.status(500).send({message: 'Error al guardar'})
                                if(!addedMagazine) return res.status(404).send({message: 'No se ha podido guardar la Revista'})
                                return res.status(200).send({Add: addedMagazine})
                            })
                        }
                   })
                }else{
                    return res.status(200).send({message: 'Rellene los campos necesarios'})
                }
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            } 
            break;
        
        case 'delete_magazine':
            if("admin" == req.user.rol){
                Magazine.findById(params[1], (err, findMagazine)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!findMagazine) return res.status(404).send({message: 'No se ha podido encontrar el usuario'})
                    findMagazine.remove((err, delMagazine)=>{
                        if (err) return res.status(500).send({message: 'Error en la peticion Eliminar'}) 
                        return res.status(200).send({Delete: delMagazine})
                    })
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }
            break;
        
        case 'update_magazine':
            if("admin" == req.user.rol){
                var cadThem = params[8];
                var container1 = cadThem.split(','); 
                var cadKey = params[9];
                var container = cadKey.split(','); 
                Magazine.findByIdAndUpdate(params[1], {author: params[2], title: params[3], edition: params[4], 
                    description: params[5], publicationFrequency: params[6], specimens: params[7], themes: container1,  
                    keywords: container,copies: params[10], available: params[11]}, {new: true}, (err, updMagazine)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!updMagazine) return res.status(404).send({message: 'No se ha podido editar los datos de la Revista'})          
                    return res.status(200).send({Update: updMagazine})
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }
            break;

        case 'view_magazine':
            if("admin" == req.user.rol){
                Magazine.find((err, searchMagazine)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!searchMagazine) return res.status(404).send({message: 'No se ha podido Mostrar'})
                    return res.status(200).send({View: searchMagazine})
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            } 
            break;
         
        //Reports
        case 'report_on_most_borrowed_books':
            if("admin" == req.user.rol){
                Book.find().sort({loan_accountantB: -1}).exec(function(err, orderedBooks){
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!orderedBooks) return res.status(404).send({message: 'No se ha podido Mostrar'})
                    return res.status(200).send({Ordered: orderedBooks})
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }
        break;

        case 'report_on_most_loaned_magazines':
            if("admin" == req.user.rol){
                Magazine.find().sort({loan_accountantM: -1}).exec(function(err, orderedBooks){
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!orderedBooks) return res.status(404).send({message: 'No se ha podido Mostrar'})
                    return res.status(200).send({Ordered: orderedBooks})
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }
        break;

        case 'report_on_most_searched_books':
            if("admin" == req.user.rol){
                Book.find().sort({search_counterB: -1}).exec(function(err, orderedBooks){
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!orderedBooks) return res.status(404).send({message: 'No se ha podido Mostrar'})
                    return res.status(200).send({Ordered: orderedBooks})
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }
        break;

        case 'report_on_most_searched_journals':
            if("admin" == req.user.rol){
                Magazine.find().sort({search_counterM: -1}).exec(function(err, orderedBooks){
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!orderedBooks) return res.status(404).send({message: 'No se ha podido Mostrar'})
                    return res.status(200).send({Ordered: orderedBooks})
                })
            }else{
                return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
            }
        break;

        //Searches 
        case 'book_search':
            var option = params[1].toLowerCase(); 
            if('titulo' == option){
                Book.findOne({title:params[2]}, (err, sb)=>{
                    var contS = sb.search_counterB;
                    Book.findByIdAndUpdate(sb._id, {search_counterB: ++contS}, {new: true},(err, update)=>{
                        if (err) return res.status(500).send({message: 'Error en la peticion 1'}) 
                    })
                })
                Book.find({title:params[2]},(err,findBook)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion 2'}) 
                    if(!findBook) return res.status(404).send({message: 'No se ha podido Mostrar'})
                    return res.status(200).send({Result: findBook})
                })
            }else if('palabra clave' == option){
                Book.findOne({keywords:{ $exists: true, $in: [params[2]]}}, (err, sb)=>{
                    var contS = sb.search_counterB;
                    Book.findByIdAndUpdate(sb._id, {search_counterB: ++contS}, {new: true},(err, update)=>{
                        if (err) return res.status(500).send({message: 'Error en la peticion 1'}) 
                    })
                })
                Book.find({keywords:{ $exists: true, $in: [params[2]]}},(err,findBook)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!findBook) return res.status(404).send({message: 'No se ha podido Mostrar'})
                    return res.status(200).send({Result: findBook})
                })
            }else{
                return res.status(500).send({message: 'Rellene los campos necesarios...'})
            }
        break;
        
        case 'magazine_search':
            var option = params[1].toLowerCase(); 
            if('titulo' == option){
                Magazine.findOne({title:params[2]}, (err, sb)=>{
                    var contS = sb.search_counterM;
                    Magazine.findByIdAndUpdate(sb._id, {search_counterM: ++contS}, {new: true},(err, update)=>{
                        if (err) return res.status(500).send({message: 'Error en la peticion 1'}) 
                    })
                })
                Magazine.find({title:params[2]},(err,findMagazine)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!findMagazine) return res.status(404).send({message: 'No se ha podido Mostrar'})
                    return res.status(200).send({Result: findMagazine})
                })
            }else if('palabra clave' == option){
                Magazine.findOne({keywords:{ $exists: true, $in: [params[2]]}}, (err, sb)=>{
                    var contS = sb.search_counterM;
                    Magazine.findByIdAndUpdate(sb._id, {search_counterM: ++contS}, {new: true},(err, update)=>{
                        if (err) return res.status(500).send({message: 'Error en la peticion 1'}) 
                    })
                })
                Magazine.find({keywords:{ $exists: true, $in: [params[2]]}},(err,findMagaz)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                    if(!findMagaz) return res.status(404).send({message: 'No se ha podido Mostrar'})
                    return res.status(200).send({Result: findMagaz})
                })
            }else{
                return res.status(500).send({message: 'Rellene los campos necesarios...'})
            }
        break;
        
        //Ordered for
        case 'ordered_books': 
            var opcion = params[1].toLowerCase();
            var order =  params[2].toLowerCase();
            if('id' == opcion){
                if('ascendente' == order || 'asc' == order){
                    Book.find().sort({_id: 1}).exec(function(err, orderedBooks){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedBooks) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedBooks})
                    })
                }else if('descendente' == order || 'desc' == order){
                    Book.find().sort({_id: -1}).exec(function(err, orderedBooks){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedBooks) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedBooks})
                    })
                }
            break;
            }else if('copias' == opcion){
                if('ascendente' == order || 'asc' == order){
                    Book.find().sort({copies: 1}).exec(function(err, orderedBooks){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedBooks) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedBooks})
                    })
                }else if('descendente' == order || 'desc' == order){
                    Book.find().sort({copies: -1}).exec(function(err, orderedBooks){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedBooks) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedBooks})
                    })
                }
            }else if('disponibles' == opcion){
                if('ascendente' == order || 'asc' == order){
                    Book.find().sort({available: 1}).exec(function(err, orderedBooks){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedBooks) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedBooks})
                    })
                }else if('descendente' == order || 'desc' == order){
                    Book.find().sort({available: -1}).exec(function(err, orderedBooks){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedBooks) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedBooks})
                    })
                }
            }else{
                return res.status(500).send({message: 'Rellene los campos...'})
            }
        break;
        
        case 'ordered_magazines':
            var opcion = params[1].toLowerCase();
            var order =  params[2].toLowerCase();
            if('id' == opcion){
                if('ascendente' == order || 'asc' == order){
                    Magazine.find().sort({_id: 1}).exec(function(err, orderedMagazines){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedMagazines) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedMagazines})
                    })
                }else if('descendente' == order || 'desc' == order){
                    Magazine.find().sort({_id: -1}).exec(function(err, orderedMagazines){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedMagazines) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedMagazines})
                    })
                }
            }else if('copias' == opcion){
                if('ascendente' == order || 'asc' == order){
                    Magazine.find().sort({copies: 1}).exec(function(err, orderedMagazines){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedMagazines) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedMagazines})
                    })
                }else if('descendente' == order || 'desc' == order){
                    Magazine.find().sort({copies: -1}).exec(function(err, orderedMagazines){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedMagazines) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedMagazines})
                    })
                }
            }else if('disponibles' == opcion){
                if('ascendente' == order || 'asc' == order){
                    Magazine.find().sort({available: 1}).exec(function(err, orderedMagazines){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedMagazines) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedMagazines})
                    })
                }else if('descendente' == order || 'desc' == order){
                    Magazine.find().sort({available: -1}).exec(function(err, orderedMagazines){
                        if (err) return res.status(500).send({message: 'Error en la peticion'}) 
                        if(!orderedMagazines) return res.status(404).send({message: 'No se ha podido Mostrar'})
                        return res.status(200).send({Ordered: orderedMagazines})
                    })
                }
            }else{
                return res.status(500).send({message: 'Rellene los campos...'})
            }    
        break;

        //Normal user
        case 'books_loan':
            if('admin' != req.user.rol){
                Book.findOne({title: params[1]}, (err,searchB)=>{
                    if(err) return res.status(500).send({message: 'Error en la peticion 1'})
                    if(!searchB) return res.status(404).send({message: 'No hay resultados...'})
                    if(0 < searchB.available){
                        var contA = searchB.available;
                        var contS = searchB.search_counterB;
                        var contLB = searchB.loan_accountantB;
                        User.findOne({LoansB:searchB._id},(err, searchLB)=>{
                            if(searchLB){
                                return res.status(500).send({message: 'Usted ya tiene este libro, no puede prestar el mismo'})
                            }else{
                                User.findById(req.user.sub, (err, searchU)=>{
                                    if(err) return res.status(500).send({message: 'Error en la peticion 2'})
                                    if(10 >= searchU.numberOfLoans){ //si un libro ya fue prestado no volverlo a prestar si id == a LoansB
                                        var contL = searchU.numberOfLoans;
                                        Book.findByIdAndUpdate(searchB._id, {available: --contA, search_counterB: ++contS, loan_accountantB: ++contLB}, {new: true},(err, update)=>{
                                            if(err) return res.status(500).send({message: 'Error en la peticion 3'})
                                            User.findByIdAndUpdate(searchU._id, {numberOfLoans: ++contL, $push:{ LoansB: searchB._id, LoanHistoryB:searchB._id}}, {new: true}, (err, addLoan)=>{
                                                if(err) return res.status(500).send({message: 'Error en la peticion 4'})
                                                return res.status(200).send({Loan: addLoan})
                                            })
                                        })
                                    }else{
                                        return res.status(500).send({message: 'Usted a alcanzado el maximo de prestamos'})
                                    }
                                
                                })
                            }
                        })
                    }else{
                        return res.status(500).send({message: 'No hay en existencia'})
                    } 
                })
            }else{
                return res.status(500).send({message: 'Debe cambiar a un usuario normal'})
            }
        break;

        case 'magazines_loan': 
            if('admin' != req.user.rol){
                Magazine.findOne({title: params[1]}, (err,searchM)=>{
                    if(err) return res.status(500).send({message: 'Error en la peticion 1'})
                    if(!searchM) return res.status(404).send({message: 'No hay resultados...'})
                    if(0 < searchM.available){
                        var contA = searchM.available;
                        var contS = searchM.search_counterM;
                        var contLB = searchM.loan_accountantM;
                        User.findOne({LoansM:searchM._id},(err, searchLM)=>{
                            if(searchLM){
                                return res.status(500).send({message: 'Usted ya tiene esta revista, no puede prestar la misma'})
                            }else{
                                User.findById(req.user.sub, (err, searchU)=>{
                                    if(err) return res.status(500).send({message: 'Error en la peticion 2'})
                                    if(10 >= searchU.numberOfLoans){
                                        var contL = searchU.numberOfLoans;
                                        Magazine.findByIdAndUpdate(searchM._id, {available: --contA, search_counterM: ++contS, loan_accountantM: ++contLB}, {new: true},(err, update)=>{
                                            if(err) return res.status(500).send({message: 'Error en la peticion 3'})
                                            User.findByIdAndUpdate(searchU._id, {numberOfLoans: ++contL, $push:{LoansM:searchM._id, LoanHistoryM:searchM._id}}, {new: true}, (err, addLoan)=>{
                                                if(err) return res.status(500).send({message: 'Error en la peticion 4'})
                                                return res.status(200).send({Loan: addLoan})
                                            })
                                        })
                                    }else{
                                        return res.status(500).send({message: 'Usted a alcanzado el maximo de prestamos'})
                                    }
                                })
                            }
                        })
                    }else{
                        return res.status(500).send({message: 'No hay en existencia'})
                    }
                })
            }else{
                return res.status(500).send({message: 'Debe cambiar a un usuario normal'})
            }
        break;
        
        case 'return_book_loan': 
            if('admin' != req.user.rol){
                Book.findById(params[1] ,(err,searchBs)=>{
                    if(err) return res.status(500).send({message: "Error en la peticion"})
                    if(!searchBs) return res.status(404).send({message: "El libro es invalido"})
                    var bs = searchBs._id;
                    User.findOne({LoansB:bs},(err, searchLB)=>{
                        if(err) return res.status(500).send({message: "Error en la peticion 2"})
                        if(searchLB){
                            User.findById(req.user.sub, (err, searchUs)=>{
                                var contA = searchBs.available;
                                var contS = searchBs.search_counterB;
                                Book.findByIdAndUpdate(bs, {available: ++contA, search_counterB: ++contS}, {new: true},(err, update)=>{
                                    if(err) return res.status(500).send({message: 'Error en la peticion 3'})
                                        var contL = searchUs.numberOfLoans;
                                        User.findByIdAndUpdate(req.user.sub, {numberOfLoans: --contL, $pull:{LoansB:searchBs._id}}, {new:true}, (err, removeLoan)=>{
                                            if(err) return res.status(500).send({message: 'Error en la peticion 3'})
                                            return res.status(200).send({RLoan: removeLoan})
                                        })
                                })
                            })
                        }else{
                            return res.status(500).send({message: 'Este libro no ha sido prestado'})  
                        }
                        
                    })
                })
            }else{
                return res.status(500).send({message: 'Debe cambiar a un usuario normal'})
            }
        break;

        case 'return_magazine_loan':
            if('admin' != req.user.rol){
                Magazine.findById(params[1] ,(err,searchBs)=>{
                    if(err) return res.status(500).send({message: "Error en la peticion"})
                    if(!searchBs) return res.status(404).send({message: "La revista es invalida"})
                    var bs = searchBs._id;
                    User.findOne({LoansM:bs},(err, searchLB)=>{
                        if(err) return res.status(500).send({message: "Error en la peticion 2"})
                        if(searchLB){
                            User.findById(req.user.sub, (err, searchUs)=>{
                                var contA = searchBs.available;
                                var contS = searchBs.search_counterM;
                                Magazine.findByIdAndUpdate(bs, {available: ++contA, search_counterM: ++contS}, {new: true},(err, update)=>{
                                    if(err) return res.status(500).send({message: 'Error en la peticion 3'})
                                        var contL = searchUs.numberOfLoans;
                                        User.findByIdAndUpdate(req.user.sub, {numberOfLoans: --contL, $pull:{LoansM:searchBs._id}}, {new:true}, (err, removeLoan)=>{
                                            if(err) return res.status(500).send({message: 'Error en la peticion 3'})
                                            return res.status(200).send({RLoan: removeLoan})
                                        })
                                })
                            })
                        }else{
                            return res.status(500).send({message: 'Este libro no ha sido prestado'})  
                        }
                        
                    })
                })
            }else{
                return res.status(500).send({message: 'Debe cambiar a un usuario normal'})
            }
        break;
            
    }
}

function BulkLoadOfBooks(req, res){ //pendiente
    var book = new Book();
    var load = req.body.commands;
    var params = load.split(';');
    var nLoad = load.split('\n');
    var arrcont = nLoad.length;
    var op = 7 * arrcont;
    var turn = 0;
    if("admin" == req.user.rol){
        while (op>=turn) {
            for(var i = 0; i>=arrcont;i++){
                var cadKey = params[turn+3];
                var container = cadKey.split(','); 
                var cadKey1 = params[turn+5];
                var container1 = cadKey1.split(',');  
               book.author = params[turn];
               book.title = params[turn+1];
               book.edition = params[turn+2];
               book.keywords = container;
               book.description = params[turn+4];
               book.themes = container1;
               book.copies = params[turn+6];
               book.available = params[turn+6];
               book.search_counterB = 0;
               book.loan_accountantB = 0;
                Book.find({ $or: [
                    {title: book.title}
                    ]}).exec((err, books)=>{
                    if(err) return res.status(500).send({message: 'Error en la peticion'})
                    if(books && books.length >=1){
                        return res.status(500).send({message: 'El libro ya fue registrado'})
                    }else{
                        book.save((err, addedBook)=>{
                            if(err) return res.status(500).send({message: 'Error al guardar'})
                            if(!addedBook) return res.status(404).send({message: 'No se ha podido guardar el Libro'})
                        })
                    }
                })
            }
            turn = turn +7;
        }
        
        Book.find((err,mostrar)=>{
            return res.status(200).send({message: mostrar})
        })
    }else{
        return res.status(404).send({message: 'Solo Admin puede realizar esta accion...'})
    }
     
    
}

module.exports = {
    central,
    BulkLoadOfBooks
}