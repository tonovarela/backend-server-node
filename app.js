const express = require("express");
const mongoose = require("mongoose");
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);



mongoose.connection.openUri("mongodb://localhost:27017/hospitalDB", (err, res) => {
    if (err) throw err;
    console.log("Mongo DB: \x1b[36m%s\x1b[0m", "online");

});

app.listen(3000, () => {
    console.log("(Express Server) Escuchando desde el puerto 3000", "online");
    console.log("Node/Express: \x1b[36m%s\x1b[0m", "online");
});