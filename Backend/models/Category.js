const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  tipo: {
    type: String,
    enum: ["Ingreso", "Egreso", "Ambos"],
    default: "Ambos"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

categorySchema.index({ userId: 1, nombre: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
