const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const UserDeviceController = require('./controller');

router.get('/', authMiddleware(), UserDeviceController.getUserDevices);
router.get('/:deviceId', authMiddleware(), UserDeviceController.getUserDeviceById);
router.delete('/:deviceId', authMiddleware(), UserDeviceController.deleteUserDevice);

module.exports = router;
