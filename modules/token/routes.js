const express = require('express');
const router = express.Router();
const TokenController = require('./controller');

router.get('/activate/:token', TokenController.activateAccount);

module.exports = router;
