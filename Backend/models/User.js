const mongoose = require("mongoose"); // <-- Importar mongoose

const userSchema = new mongoose.Schema({   // <-- Crear un esquema
    username: { type: String, required: true, unique: true, trim: true},  // <-- Campo username de tipo String, obligatorio
    password: { type: String, required: true}, // <-- Campo password de tipo String, obligatorio
    createdAt: { type: Date, default: Date.now} // <-- Campo para guardar la fecha de creacion - Date.now hace que se llene solo
});

module.exports = mongoose.model("User", userSchema);

