const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User")

const createToken = (user) => jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
);

// Register

const registerHandler = async (req, res) => {
    try {
        const username = req.body.username && req.body.username.trim();
        const { password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username y password son obligatorios" });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ error: "El usuario ya existe" });
        }

        //Encrypt password

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User ({
            username,
            password: hashedPassword
        });

        await user.save();

        const token = createToken(user);

        res.status(201).json({
            message: "Usuario creado",
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "El usuario ya existe" });
        }

        res.status(500).json({ error: error.message });
    }
};

const loginHandler = async (req, res) => {
    try {
        const username = req.body.username && req.body.username.trim();
        const { password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username y password son obligatorios" });
        }

        //Buscar usuario

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado "});
        }

        //Comparar contraseña

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Contraseña incorrecta "});
        }

        //Crear token

        const token = createToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

router.post("/register", registerHandler);
router.post("/api/register", registerHandler);
router.post("/login", loginHandler);
router.post("/api/login", loginHandler);

module.exports = router;
