const express = require("express");

var app = express();

var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");


///////////////////////////////
//  Busqueda por coleccion
///////////////////////////////

app.get("/coleccion/:tabla/:busqueda", (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, "i");
    var promesa;
    switch (tabla) {
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        case 'usuarios':
            promesa = buscarUsuario(regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: "Se necesita el nombre de la tabla [medicos,usuarios y hospitales]"
            });
            break;
    }

    promesa.then(function(data) {
        return res.status(200).json({
            ok: true,
            [tabla]: data
        });

    });

});





///////////////////////////////
//  Busqueda General
///////////////////////////////
app.get("/todo/:busqueda", (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, "i");

    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuario(regex)
    ]).then(respuestas => {
        return res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({
                nombre: regex
            })
            .populate("usuario", "nombre email")
            .exec((err, hospitales) => {
                if (err) {
                    reject("Error al cargar hospitales", err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({
                nombre: regex
            })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {
                if (err) {
                    reject("Error al cargar medicos", err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuario(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{
                nombre: regex
            }, {
                email: regex
            }])
            .exec((err, usuarios) => {
                if (err) {
                    reject("error al cargar los usuarios", err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;