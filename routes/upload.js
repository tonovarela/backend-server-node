const express = require("express");
const fileUpload = require("express-fileupload");
var fs = require("fs");

var app = express();

app.use(fileUpload());

var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
app.put("/:tipo/:id", (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: "No se selecciono nada",
            errors: { message: "Debe de seleccionar una image" }
        });
    }
    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split(".");
    var extension = nombreCortado[nombreCortado.length - 1];

    //Solo estas extension aceptamos
    var extensionesValidas = ["png", "gif", "jpg", "jpeg"];
    var tiposValidos = ["usuarios", "medicos", "hospitales"];

    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: "Tipo no valido",
            errors: { message: "Tipos validos" + tiposValidos.join(", ") }
        });
    }
    if (extensionesValidas.indexOf(extension) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: "Extension no validas",
            errors: {
                message: "Extensiones validas " + extensionesValidas.join(", ")
            }
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //Mover Archivo a un path especifico
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, function(err) {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: "Error al mover el archivo",
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res)


    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === "usuarios") {
        Usuario.findById(id, (err, usuario) => {


            if (!usuario) {
                return res.status(404).json({
                    ok: false,
                    mensaje: "Usuario no existe",
                    errors: { message: 'Usuario no existe' }
                });
            }
            var pathViejo = "./uploads/usuarios/" + usuario.img;
            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "imagen de usuario actualizado",
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === "medicos") {
        Medico.findById(id, (err, medico) => {
            var pathViejo = "./uploads/medicos/" + medico.img;


            if (!medico) {
                return res.status(404).json({
                    ok: false,
                    mensaje: "medico no existe",
                    errors: { message: 'Medico no existe' }
                });
            }

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "imagen de medico actualizado",
                    medico: medicoActualizado
                });
            });
        });


    }
    if (tipo === "hospitales") {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(404).json({
                    ok: false,
                    mensaje: "hospital no existe",
                    errors: { message: 'Hospital no existe' }
                });
            }
            var pathViejo = "./uploads/hospitales/" + hospital.img;
            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "imagen de hospital actualizado",
                    hospital: hospitalActualizado
                });
            });
        });
    }
}
module.exports = app;