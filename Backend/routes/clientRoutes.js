const express = require("express"); // Perimte crear rutas como /clients
const router = express.Router(); //Crea un "miniservidor" de rutas
const mongoose = require("mongoose");
const authMiddleware = require("../Source/middleware/authMiddleware");

const Client = require("../models/Client"); //Trae el modelo de cliente

const pickClientFields = (body) => {
    const allowedFields = ["nombre", "email", "rfc", "telefono"];
    const data = {};

    allowedFields.forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });

    return data;
};

const isValidId = (id) => mongoose.isValidObjectId(id);

const handleError = (res, error) => {
    if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
};

//Post /clients

router.post("/clients", authMiddleware, async (req, res) => { /*Post envia datos al servidor, /clients es la ruta hacia la que se hace la peticion
    req - Lo que envia el cliente, res - lo que se responde, async permite hacer varias cosas al mismo tiempo*/
    try { //Bloque try, ejecuta el codigo, si algo falla, saltar al catch
        const newClient = new Client({
            ...pickClientFields(req.body),
            userId: req.user.userId
        }); //Crear un objeto basado en el modelo cliente

        await newClient.save(); //Guarda el cliente en MongoDB, Si no existe, crea la coleccion y le genera un id automaticamente

        res.status(201).json(newClient);
    } catch (error) {
        handleError(res, error);
    }
});

//Get /Clients

router.get("/clients", authMiddleware, async (req, res) => {
    try {
        const clients = await Client.find({ userId: req.user.userId });

        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
});

//Get by id /Clients

router.get("/clients/:id", authMiddleware, async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ error: "Id de cliente invalido" });
        }

        const client = await Client.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!client) {
            return res.status(404).json({ error: "Cliente no encontrado " });
        }
        
        res.status(200).json(client);
    } catch (error) {
        handleError(res, error);
    }
}); 

// Put /Update clients

router.put("/clients/:id", authMiddleware, async (req, res) =>{
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ error: "Id de cliente invalido" });
        }

        const updateData = pickClientFields(req.body);

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No hay campos validos para actualizar" });
        }

        const updatedClient = await Client.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedClient) {
            return res.status(404).json ({ error: "Cliente no encontrado "});
        }

        res.status(200).json(updatedClient);
    } catch (error) {
        handleError(res, error);
    }
});

//Delete Clients

router.delete("/clients/:id", authMiddleware, async (req, res) =>{
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ error: "Id de cliente invalido" });
        }

        const deletedClient = await Client.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!deletedClient) { 
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.status(200).json ({ message: "Cliente eliminado" });
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
