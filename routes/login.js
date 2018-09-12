const express = require("express");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SEED = require("../config/config").SEED;
const CLIENT_ID = require("../config/config").CLIENT_ID;

var Usuario = require("../models/usuario");

var app = express();

var Usuario = require("../models/usuario");

///////////////////////////////
//  Google
///////////////////////////////

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture
    };
}

///////////////////////////////
//  Autenticacion de Google
///////////////////////////////
app.post("/google", async(req, res) => {
    var token = req.body.token || "";

    var googleUser;
    try {
        googleUser = await verify(token);
    } catch (error) {
        return res.status(403).send({
            ok: false,
            mensaje: "Token no válido",
            error: error.message
        });
    }
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).send({
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(500).send({
                    ok: false,
                    mensaje: "Dede de usar su autenticacion normal"
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id
                });

            }
        } else {
            // El usuario no existe -- Se registra
            console.log(googleUser);
            var usuario = new Usuario();
            usuario.nombre = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ":)";

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id

                });

            });

        }
    });
});



///////////////////////////////
//  Login Normal
///////////////////////////////
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
                mensaje: "Credenciales incorrectas -password"
            });
        }
        usuarioDB.password = ":)";
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