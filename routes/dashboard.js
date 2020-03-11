const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../config/auth').ensureAuthenticated;

router.get('/', ensureAuthenticated, async (req, res) => {
    res.render('index');
});

module.exports = router;