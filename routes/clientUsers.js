const express = require('express');
const router = express.Router();
const ClientUser = require('../models/discriminators/ClientUser');
const { USER_ROLES } = require('../constants/userRoles');
const authorizeRoles = require('../middleware/authorizedRoles');
const MESSAGES = require('../constants/messages');
const sanitizeBody = require('../helpers/sanitizeBody');
const UserDevices = require('../models/UserDevices');
const UserSettings = require('../models/UserSettings');
const bcrypt = require('bcryptjs/dist/bcrypt');

//GET all clientUser - Admin only
router.get('/', authorizeRoles(USER_ROLES.ADMIN), async (req, res) => {
    try {
        const clientUser = await ClientUser.find().select('-password');
        res.status(200).json(clientUser);
    } catch (err) {
        console.error('Error retrieving clientUser:', err);
        res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR });
    }
});

//GET one clientUser by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Trova il clientUser per ID e escludi la password dal risultato
        const clientUser = await ClientUser.findById(id).select('-password'); // '-password' esclude la password

        if (!clientUser) {
            return res.status(404).json({ message: MESSAGES.GENERAL.CLIENTUSER_NOT_FOUND });
        }

        res.status(200).json(clientUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR });
    }
});

//PATCH update clientUser profile
router.patch('/:id', async (req, res) => {
    try {
        const clientUserId = req.params.id;

        //verifica che l'utente stia modificando se stesso
        if (req.user._id.toString() !== clientUserId) {
            return res.status(403).json({ message: MESSAGES.GENERAL.UNAUTHORIZED_ACCESS });
        }

        const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'dateOfBirth', 'biography', 'profileImg', 'socialLinks', 'gender', 'healthData', 'fitnessLevel', 'goals', 'activityLevel', 'preferences', 'currentSports', 'competitiveLevel'];

        //Pulisco il body da campi non validi
        const sanitizedBody = sanitizeBody(req.body, allowedFields);

        if (sanitizedBody == {}) {
            return res.status(400).json({ message: MESSAGES.VALIDATION.NO_VALID_FIELDS });
        }

        const updatedClientUser = await ClientUser.findByIdAndUpdate(clientUserId, { $set: sanitizedBody }, { new: true }).select('-password');
        if (!updatedClientUser) {
            return res.status(404).json({ message: MESSAGES.GENERAL.CLIENTUSER_NOT_FOUND });
        }

        res.status(200).json(updatedClientUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const clientUserId = req.params.id;
        const oldPassword = req.body.password; // Password inviata nel body della richiesta

        //verifica che l'utente stia modificando se stesso
        if (req.user._id.toString() !== clientUserId) {
            return res.status(403).json({ message: MESSAGES.GENERAL.UNAUTHORIZED_ACCESS });
        }


        // Trova il clientUser per ID e verifica la password
        const clientUser = await ClientUser.findById(clientUserId);
        if (!clientUser) {
            return res.status(404).json({ message: MESSAGES.GENERAL.CLIENTUSER_NOT_FOUND });
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, clientUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: MESSAGES.VALIDATION.PASSWORD_MISMATCH });
        }

        // Se la password è corretta, procedi con l'eliminazione
            await UserDevices.deleteMany({user: clientUserId});
            await UserSettings.deleteMany({user: clientUserId});
        const deletedClientUser = await ClientUser.findByIdAndDelete(clientUserId);
        if (!deletedClientUser) {
            return res.status(404).json({ message: MESSAGES.GENERAL.CLIENTUSER_NOT_FOUND });
        }

        res.status(200).json({ message: MESSAGES.GENERAL.ACCOUNT_DELETED });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR });
    }
});

module.exports = router;