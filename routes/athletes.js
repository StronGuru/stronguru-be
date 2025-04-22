const express = require('express');
const router = express.Router();
const Athlete = require('../models/discriminators/Athlete');
const { USER_ROLES } = require('../constants/userRoles');
const authorizeRoles = require('../middleware/authorizedRoles');

//GET all athletes - Admin only
router.get('/', authorizeRoles(USER_ROLES.ADMIN), async (req, res) => {
    try {
        const athletes = await Athlete.find().select('-password');
        res.status(200).json(athletes);
    } catch (err) {
        console.error('Error retrieving athletes:', err);
        res.status(500).json({ message: 'Server error'});
    }
});

module.exports = router;