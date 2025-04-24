const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserToken = require("../models/UserToken");
const MESSAGES = require('../constants/messages');

// GET /token/activate/:token
router.get("/activate/:token", async (req, res) => {
    try {
        const { token } = req.params;

        // Check if token exists and is for activation
        const tokenEntry = await UserToken.findOne({ token, type: "activation" });
        if (!tokenEntry) {
            return res.status(400).json({ message: MESSAGES.TOKEN.INVALID_OR_EXPIRED });
        }

        // Activate user
        await User.findByIdAndUpdate(tokenEntry.userId, { isVerified: true });

        // Delete token after use
        await UserToken.findByIdAndDelete(tokenEntry._id);

        res.json({ message: MESSAGES.TOKEN.ACTIVATION_SUCCESS });
    } catch (err) {
        console.error("Errore attivazione:", err);
        res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR });
    }
});

module.exports = router;