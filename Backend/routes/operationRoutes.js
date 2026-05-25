const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../Source/middleware/authMiddleware");

const Operation = require("../models/Operation")
const Client = require("../models/Client");

const pickOperationFields = (body) => {
  const allowedFields = ["clienteId", "tipo", "monto", "categoria", "fecha"];
  const data = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  });

  return data;
};

const isValidId = (id) => mongoose.isValidObjectId(id);

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const isValidTipo = (tipo) => ["ingreso", "egreso"].includes(tipo);

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const handleError = (res, error) => {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ error: error.message });
  }

  return res.status(500).json({ error: error.message });
};

//Post /Operations

router.post("/operations", authMiddleware, async (req, res) => {
    try {
        if (!req.body.clienteId || !isValidId(req.body.clienteId)) {
            return res.status(400).json({ error: "Id de cliente invalido" });
        }

        const client = await Client.findOne({
            _id: req.body.clienteId,
            userId: req.user.userId
        });

        if (!client) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        const newOperation = new Operation({
            ...pickOperationFields(req.body),
            usuarioId: req.user.userId
        });

        await newOperation.save();

        res.status(201).json(newOperation);
    } catch (error) {
        handleError(res, error);
    }
});


// Get /operations/summary

router.get("/operations/summary", authMiddleware, async (req, res) => {
  try {
    const { clienteId, from, to, tipo } = req.query;

    let match = { usuarioId: toObjectId(req.user.userId) };

    if (tipo) {
      if (!isValidTipo(tipo)) {
        return res.status(400).json({ error: "Tipo de operacion invalido" });
      }

      match.tipo = tipo;
    }

    if (clienteId) {
      if (!isValidId(clienteId)) {
        return res.status(400).json({ error: "Id de cliente invalido" });
      }

      match.clienteId = toObjectId(clienteId);
    }

    if (from || to) {
      match.fecha = {};

      if (from) {
        const fromDate = parseDate(from);
        if (!fromDate) {
          return res.status(400).json({ error: "Fecha inicial invalida" });
        }
        match.fecha.$gte = fromDate;
      }

      if (to) {
        const toDate = parseDate(to);
        if (!toDate) {
          return res.status(400).json({ error: "Fecha final invalida" });
        }
        match.fecha.$lte = toDate;
      }
    }

    const result = await Operation.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIngresos: {
            $sum: {
              $cond: [{ $eq: ["$tipo", "ingreso"] }, "$monto", 0]
            }
          },
          totalEgresos: {
            $sum: {
              $cond: [{ $eq: ["$tipo", "egreso"] }, "$monto", 0]
            }
          }
        }
      }
    ]);

    const summary = result[0] || {
      totalIngresos: 0,
      totalEgresos: 0
    };

    res.json({
      totalIngresos: summary.totalIngresos,
      totalEgresos: summary.totalEgresos,
      balance: summary.totalIngresos - summary.totalEgresos
    });

  } catch (error) {
    handleError(res, error);
  }
});

// Get /operations

router.get("/operations", authMiddleware, async (req, res) => {
  try {
    const { clienteId, tipo, from, to } = req.query;

    let filtro = { usuarioId: req.user.userId };

    if (clienteId) {
      if (!isValidId(clienteId)) {
        return res.status(400).json({ error: "Id de cliente invalido" });
      }

      filtro.clienteId = clienteId;
    }

    if (tipo) {
      if (!isValidTipo(tipo)) {
        return res.status(400).json({ error: "Tipo de operacion invalido" });
      }

      filtro.tipo = tipo;
    }

    if (from || to) {
      filtro.fecha = {};

      if (from) {
        const fromDate = parseDate(from);
        if (!fromDate) {
          return res.status(400).json({ error: "Fecha inicial invalida" });
        }
        filtro.fecha.$gte = fromDate;
      }

      if (to) {
        const toDate = parseDate(to);
        if (!toDate) {
          return res.status(400).json({ error: "Fecha final invalida" });
        }
        filtro.fecha.$lte = toDate;
      }
    }

    const operations = await Operation.find(filtro)
      .populate("clienteId", "nombre")
      .sort({ fecha: -1 });

    res.status(200).json(operations);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
