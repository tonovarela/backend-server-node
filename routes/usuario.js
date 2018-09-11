const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

var mdAutenticacion = require("../middleware/autenticacion");

var Usuario = require("../models/usuario");

var app = express();

//Listar todos los usuarios
app.get("/", (req, res, next) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, "nombre role email img")
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando usuarios",
                    errors: err
                });
            }
            Usuario.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    usuarios,
                    total: conteo
                });
            });
        });
});

// Actualizar usuario

app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar al usuario",
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(500).json({
                ok: false,
                mensaje: "El usuario con el id " + id + " no se encontro",
                errors: {
                    mensaje: "No existe un usuario con ese ID"
                }
            });
        }

        usuarioDB.nombre = body.nombre;
        usuarioDB.email = body.email;
        usuarioDB.role = body.role;

        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar el usuario",
                    errors: err
                });
            }
            usuarioGuardado.password = ":)";
            return res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                mensaje: "Usuario actualizado"
            });
        });
    });
});

//Crear un nuevo usuario

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear al usuario",
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});

// Borrar el usuario

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error borrar usuario",
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un usuario con ese ID",
                errors: err
            });
        }

        return res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;