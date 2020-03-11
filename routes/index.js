const express = require('express');
const router = express.Router();

router.use('/', require('./dashboard'));
router.use('/', require('./users'));
router.use('/', require('./profile'));
router.use('/', require('./universities'));
router.use('/', require('./books'));

/** API REQUESTS */
router.use('/api', require('./api/'));

module.exports = router;