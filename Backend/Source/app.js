const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") }); // cargar variables

const express = require("express");
const connectDB = require("./config/db"); // importar conexión
const clientRoutes = require("../routes/clientRoutes"); //importa el client routes
const authRoutes = require("../routes/authRoutes");
const operationRoutes = require("../routes/operationRoutes");
const userRoutes = require("../routes/userRoutes");
const categoryRoutes = require("../routes/categoryRoutes");

const app = express();

// Permitir que el frontend local consuma la API del backend.
app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:4173", "http://127.0.0.1:4173"];
  const origin = req.header("Origin");

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  } 

  next();
});

//  conectar a Mongo
connectDB();

//Middleware para leer json

app.use(express.json());

//Conectar rutas

app.use(clientRoutes);
app.use(operationRoutes);
app.use(categoryRoutes);
app.use("/api", clientRoutes);
app.use("/api", operationRoutes);
app.use("/api", categoryRoutes);

app.get("/", (req, res) => {
  res.send("Conectado");
});

app.use(authRoutes);
app.use(userRoutes);

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});
