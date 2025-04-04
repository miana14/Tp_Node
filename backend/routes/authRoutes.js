const express = require('express');
const router = express.Router();
// Importation de la fonction de connexion et du middleware d'authentification
const {login, logout} = require("../controllers/AuthController");
const {authMiddleware} = require("../middlewares/authMiddleware");
const {csrfMiddleware} = require("../middlewares/csrfMiddleware");

// Route POST pour la connexion de l'utilisateur
router.post("/login", csrfMiddleware, login);

router.post("/logout", csrfMiddleware, logout)
// Route GET protégée pour afficher le profil de l'utilisateur
router.get("/profil", authMiddleware, (req, res) => {
    // Cette route est protégée par le middleware d'authentification, donc l'utilisateur doit être connecté
    res.json({ message: "Bienvenue sur ton profil.", user: {id: req.user.id, name: req.user.name, firstname: req.user.firstname, email: req.user.email, role: req.user.role}});
});
module.exports = router;