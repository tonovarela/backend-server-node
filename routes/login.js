const express = require("express");
var bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

var app = express();

var Usuario = require("../models/usuario");

app.post("/", (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "error al buscar usuario"
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas -email"
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas -password",

            });
        }
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

        return res.status(200).json({
            ok: true,
            mensaje: "Login post creado",
            usuario: usuarioDB,
            token,
            id: usuarioDB.id
        });
    });
});

module.exports = app;