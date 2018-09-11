const express = require("express");

var mdAutenticacion = require("../middleware/autenticacion");

var Hospital = require("../models/hospital");

var app = express();

//Listar todos los hospitales
app.get("/", (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate("usuario", "nombre email")
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando los hospitales",
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    hospitales,
                    total: conteo
                });
            });
        });
});

//Crear un nuevo hospital
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear al usuario",
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            usuario: hospitalGuardado,
            usuariotoken: req.usuario
        });
    });
});

//Actualiza hospital
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospitalDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar al hospital",
                errors: err
            });
        }

        if (!hospitalDB) {
            return res.status(500).json({
                ok: false,
                mensaje: "El hospital con el id " + id + " no se encontro",
                errors: {
                    mensaje: "No existe un hospital con ese ID"
                }
            });
        }

        hospitalDB.nombre = body.nombre;
        hospitalDB.img = body.img;
        hospitalDB.usuario = req.usuario._id;

        hospitalDB.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar el  hospital",
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                usuario: hospitalGuardado,
                mensaje: "hospital actualizado"
            });
        });
    });
});

// Borrar el hospital

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error borrar hospital",
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un hospital con ese ID",
                errors: err
            });
        }

        return res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });
    });
});

module.exports = app;