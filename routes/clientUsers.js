const express = require('express');
const router = express.Router();
const ClientUser = require('../models/discriminators/ClientUser');
const { USER_ROLES } = require('../constants/userRoles');
const authorizeRoles = require('../middleware/authorizedRoles');

//GET all clientUser - Admin only
router.get('/', authorizeRoles(USER_ROLES.ADMIN), async (req, res) => {
    try {
        const clientUser = await ClientUser.find().select('-password');
        res.status(200).json(clientUser);
    } catch (err) {
        console.error('Error retrieving clientUser:', err);
        res.status(500).json({ message: 'Server error'});
    }
});

module.exports = router;