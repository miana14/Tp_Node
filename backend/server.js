(async () =>  {
require ('dotenv');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require("crypto");

const { initDB }  = require('./config/db')

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization, X-CSRF-Token"
}));

app.get("/csrf-token", (req, res) => {
    const csrfToken = crypto.randomBytes(32).toString("hex");
    res.cookie("csrfToken", csrfToken, {
        httpOnly: false, // Doit être accessible par le frontend
        secure: true, // Active en HTTPS
        sameSite: "Strict"
    });
    res.json({ csrfToken });
});

const produitRoutes = require('./routes/produitRoutes');
const userRoutes = require('./routes/userRoutes');
const categorieRoutes = require('./routes/categorieRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/produits', produitRoutes);
app.use('/users', userRoutes);
app.use('/categories', categorieRoutes);
app.use('/commandes', commandeRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

try {
    await initDB();
    
    app.listen(port, () => {
        console.log(`Serveur démarré sur le port ${port}`);
    });
} catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'application:', error);
}
})();
