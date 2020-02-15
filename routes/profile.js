const express = require('express');
const router = express.Router();

router.get('/profile/me', (req, res) => {
    res.render('users/profile/profile');
});

module.exports = router;