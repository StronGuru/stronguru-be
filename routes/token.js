/**
 * @swagger
 * tags:
 *   name: Token
 *   description: API per la gestione dei token di attivazione
 */

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserToken = require("../models/UserToken");


/**
 * @swagger
 * /token/activate/{token}:
 *   get:
 *     summary: Attiva un account utente tramite token
 *     tags: [Token]
 *     description: Verifica il token di attivazione, attiva l'account e rimuove il token dopo l'uso.
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         description: Token di attivazione inviato via email.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account attivato con successo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account attivato con successo!"
 *       400:
 *         description: Token non valido o scaduto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token non valido o scaduto"
 *       500:
 *         description: Errore nell'attivazione dell'account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Errore nell'attivazione dell'account"
 */
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