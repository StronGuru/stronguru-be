const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserToken = require("../models/UserToken");

// GET /token/activate/:token
router.get("/activate/:token", async (req, res) => {
    try {
        const { token } = req.params;

        // Controlla se il token esiste nel DB
        const tokenEntry = await UserToken.findOne({ token, type: "activation" });
        if (!tokenEntry) {
            return res.status(400).json({ message: "Token non valido o scaduto" });
        }

        // Attiva l'utente
        await User.findByIdAndUpdate(tokenEntry.userId, { isVerified: true });

        // Rimuovi il token dopo l'attivazione
        await UserToken.findByIdAndDelete(tokenEntry._id);

        res.json({ message: "Account attivato con successo!" });
    } catch (err) {
        console.error("Errore attivazione:", err);
        res.status(500).json({ message: "Errore nell'attivazione dell'account" });
    }
});

module.exports = router;