const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    //res.json(recordsData);

    res.render('index');
});

module.exports = router;