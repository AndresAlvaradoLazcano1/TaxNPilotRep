const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const authMiddleware = (req, res, next) => {
    try {
        //Obtener cabecera

        const authHeader = req.header("Authorization");

        //Verificar que exista

        if (!authHeader) {
            return res.status(401).json({ error: "Acceso denegado: No hay token" });
        }

        //Formato esperado: Bearer token

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Formato de token invalido" });
        }

        const token = authHeader.replace("Bearer ","");

        //Verificar token

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId || !mongoose.isValidObjectId(decoded.userId)) {
            return res.status(401).json({ error: "Token invalido" });
        }

        //Guardar info del usuario

        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({ error: "Token invalido "});
    }
};

module.exports = authMiddleware;
