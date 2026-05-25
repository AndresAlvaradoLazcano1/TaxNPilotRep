const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../Source/middleware/authMiddleware");

const Category = require("../models/Category");

const allowedTypes = ["Ingreso", "Egreso", "Ambos"];

const isValidId = (id) => mongoose.isValidObjectId(id);

const pickCategoryFields = (body) => {
  const data = {};

  if (body.nombre !== undefined) {
    data.nombre = body.nombre;
  }

  if (body.tipo !== undefined) {
    data.tipo = body.tipo;
  }

  return data;
};

const validateCategory = (data) => {
  if (data.nombre !== undefined && data.nombre.trim() === "") {
    return "El nombre de la categoria es obligatorio";
  }

  if (data.tipo !== undefined && !allowedTypes.includes(data.tipo)) {
    return "Tipo de categoria invalido";
  }

  return null;
};

const handleError = (res, error) => {
  if (error.code === 11000) {
    return res.status(400).json({ error: "La categoria ya existe" });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ error: error.message });
  }

  return res.status(500).json({ error: error.message });
};

router.get("/categories", authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.userId }).sort({ nombre: 1 });
    res.json(categories);
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/categories", authMiddleware, async (req, res) => {
  try {
    const data = pickCategoryFields(req.body);
    const validationError = validateCategory(data);

    if (!data.nombre || validationError) {
      return res.status(400).json({ error: validationError || "El nombre de la categoria es obligatorio" });
    }

    const category = new Category({
      ...data,
      userId: req.user.userId
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/categories/:id", authMiddleware, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Id de categoria invalido" });
    }

    const data = pickCategoryFields(req.body);
    const validationError = validateCategory(data);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No hay campos validos para actualizar" });
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      data,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: "Categoria no encontrada" });
    }

    res.json(category);
  } catch (error) {
    handleError(res, error);
  }
});

router.delete("/categories/:id", authMiddleware, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Id de categoria invalido" });
    }

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!category) {
      return res.status(404).json({ error: "Categoria no encontrada" });
    }

    res.json({ message: "Categoria eliminada" });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
