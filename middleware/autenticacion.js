const jwt = require("jsonwebtoken");
const SEED = require("../config/config").SEED;
// Midleware
//Verificar token
//
exports.verificaToken = function(req, res, next) {
    let token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: "token no valido"
            });
        }
        req.usuario = decoded.usuario;
        // next();
        // return res.status(200).json({
        //     ok: true,
        //     decoded
        // });
        next();
    });
};