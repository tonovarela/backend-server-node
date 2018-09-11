const express = require("express");



var mdAutenticacion = require("../middleware/autenticacion");

var Medico = require("../models/medico");

var app = express();

///////////////////////////////
//  Listar todos los medicos
///////////////////////////////
app.get("/", (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando los medicos",
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo
                });
            });

        });

});

///////////////////////////////
//  Crear un medico
///////////////////////////////


app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.id_hospital

    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear al medico",
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuariotoken: req.usuario
        });
    });
});

///////////////////////////////
//  Actualizar un medico
///////////////////////////////
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medicoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el medico",
                errors: err
            });
        }

        if (!medicoDB) {
            return res.status(500).json({
                ok: false,
                mensaje: "El medico con el id " + id + " no se encontro",
                errors: {
                    mensaje: "No existe un medico con ese ID"
                }
            });
        }

        medicoDB.nombre = body.nombre;
        medicoDB.img = body.img;
        medicoDB.usuario = req.usuario._id;
        medicoDB.hospital = body.id_hospital;


        medicoDB.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar el  medico",
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                mensaje: "medico actualizado"
            });
        });
    });
});


///////////////////////////////
//  Borrar un medico
///////////////////////////////

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error borrar medico",
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un medico con ese ID",
                errors: err
            });
        }

        return res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});



module.exports = app;