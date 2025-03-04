const express = require('express');
const router = express.Router();
// Importation de la fonction de connexion et du middleware d'authentification
const {login} = require("../controllers/AuthController");
const {authMiddleware} = require("../middlewares/authMiddleware")

// Route POST pour la connexion de l'utilisateur
router.post("/login", login);

// Route GET protégée pour afficher le profil de l'utilisateur
router.get("/profil", authMiddleware, (req, res) => {
    // Cette route est protégée par le middleware d'authentification, donc l'utilisateur doit être connecté
    res.json({ message: "Bienvenue sur ton profil.", user: req.user });
});
module.exports = router;