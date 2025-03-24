const mongoose = require("mongoose");

const UserTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    type: { type: String, enum: ["activation", "password_reset"], required: true },
    expiresAt: { type: Date, required: true, default: () => Date.now() + 24 * 60 * 60 * 1000 }, // Scadenza 24h
});

module.exports = mongoose.model("UserToken", UserTokenSchema);