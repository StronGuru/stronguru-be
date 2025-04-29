// const express = require('express');
// const router = express.Router();
// const UserDevices = require('../models/UserDevices');

// // GET /devices/users/:userId - Get all devices for a user
// router.get('/user/:userId', async (req, res) => {
//     try {
//       const devices = await UserDevices.find({ user: req.params.userId });
//       res.status(200).json(devices);
//     } catch (err) {
//       res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR });
//     }
//   });

// // GET /devices/:id - Get single device by ID
//   router.get('/:id', async (req, res) => {
//     try {
//       const device = await UserDevices.findById(req.params.id);
//       if (!device) return res.status(404).json({ message: MESSAGES.GENERAL.DEVICE_NOT_FOUND });
//       res.json(device);
//     } catch (err) {
//       res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR });
//     }
//   });

// // DELETE /devices/:id - Delete a devices by ID
//   router.delete('/:id', async (req, res) => {
//     try {
//       const deleted = await UserDevices.findByIdAndDelete(req.params.id);
//       if (!deleted) return res.status(404).json({ message: MESSAGES.GENERAL.DEVICE_NOT_FOUND });
//       res.json({ message: 'Device successfully deleted.' });
//     } catch (err) {
//       res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR });
//     }
//   });

//   module.exports = router;
