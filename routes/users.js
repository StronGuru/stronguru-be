const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
require('dotenv').config(); // Per leggere le variabili d'ambiente
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { USER_ROLES } = require('../constants/userRoles');
const authorizeRoles = require('../middleware/authorizedRoles');
const MESSAGES = require('../constants/messages');

//GET all users - Admin only
router.get('/', authorizeRoles(USER_ROLES.ADMIN), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR  });
    }
});

//GET all ambassadors (optional filtered by role)
router.get('/ambassadors', authorizeRoles(USER_ROLES.ADMIN), async (req, res) => {
    try {
        const roleFilter = req.query.role;
        const query = { ambassador: true };

        if (roleFilter) {
            query.role = roleFilter;
        }

        const ambassadors = await User.find(query).select('-password');
        res.status(200).json(ambassadors);
    } catch (err) {
        console.error('Error fetching ambassadors:', err);
        res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR});
    }
});

//##### PATCH #####
// Patch /users/:id/ambassador - Admin only
router.patch('/:id/ambassador', authorizeRoles(USER_ROLES.ADMIN), async (req, res) => {
  try {
    const userId = req.params.id;
    const { ambassador } = req.body;

    if (typeof ambassador !== 'boolean') {
      return res.status(400).json({ message: MESSAGES.VALIDATION.INVALID_AMBASSADOR_VALUE });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND });
    }

    user.ambassador = ambassador;
    await user.save();

    res.status(200).json({ message: MESSAGES.SIGNUP.AMBASSADOR_STATUS_UPDATED(ambassador)});
  } catch (err) {
    console.error('Error updating ambassador status:', err);
    res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR});
  }
})

module.exports = router;
