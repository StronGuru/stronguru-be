const express = require('express');
const router = express.Router();
const Athlete = require('../models/discriminators/Athlete');
const { USER_ROLES } = require('../constants/userRoles');
const authorizeRoles = require('../middleware/authorizedRoles');


/**
 * @swagger
 * /athletes:
 *   get:
 *     summary: Retrieve all users with athlete role
 *     tags: [Athlete]
 *     description: Returns all users who are athletes. Admin access only.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Athletes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

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