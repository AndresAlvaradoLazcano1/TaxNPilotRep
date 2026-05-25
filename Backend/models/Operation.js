const mongoose = require("mongoose");

const operationSchema = new mongoose.Schema({
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },

    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    tipo: {
        type: String,
        enum: ["ingreso", "egreso"],
        required: true
    },

    monto: {
        type: Number,
        required: true
    },
    categoria: String,
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Operation", operationSchema)
