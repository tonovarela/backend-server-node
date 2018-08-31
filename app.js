const express = require("express");
const mongoose = require("mongoose");

var app = express();

mongoose.connection.openUri("mongodb://localhost:27017/hospitalDB", (err, res) => {
    if (err) throw err;
    console.log("Mongo DB: \x1b[36m%s\x1b[0m", "online");

});

app.get("/", (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: "Peticion ok"
    });


    return res;
});

app.listen(3000, () => {
    console.log("(Express Server) Escuchando desde el puerto 3000", "online");
    console.log("Node/Express: \x1b[36m%s\x1b[0m", "online");
});