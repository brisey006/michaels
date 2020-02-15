const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const slugify = require('../functions/index').slugify;
const enc = require('../config/enc');

const User = require('../models/user');
const URL = require('../models/url');

router.get('/user', (req, res) => {
    const user = new User({
        firstName: 'Percy',
        lastName: 'Mudzinganyama',
        email: 'percymudzinga@gmail.com',
        password: 'admin1234',
        userType: 'super-admin'
    });

    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) throw err;
        user.password = hash;
        
        user.save().then(user => {
            res.json(user);
        }).catch(err => {
            res.json(err);
        })
    }));
});

router.get('/enc/:key', (req, res) => {
    res.send(enc.decrypt(req.params.key));
});

router.get('/urls', async (req, res) => {
    const urlArray = require('./urls');
    const status = [];

    for (let i = 0; i < urlArray.length; i++) {
        const url = urlArray[i];
        try {
            const newUrl = new URL({ name: url.name, url: url.url });
            await newUrl.save();
            status.push(`${url.name} saved.`);
        } catch (e) {
            await URL.updateOne({ name: url.name }, { $set: { url: url.url } });
            status.push(`${url.name} updated.`);
        }
    }
    res.json(status);
});

module.exports = router;
