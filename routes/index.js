const express = require('express');
const router = express.Router();

router.use('/', require('./dashboard'));
router.use('/', require('./users'));
router.use('/', require('./profile'));

module.exports = router;