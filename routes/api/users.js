const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const NodeRSA = require('node-rsa');
const fs = require('fs');
const randomString = require('random-string');

const User = require('../../models/user');

router.get('/users/logout', (req, res) => {
    req.logOut();
    res.redirect('/users/login');
});

router.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
  .then(user => {
      if(!user) {
          return done(null, false, { message: 'That email is not registered' });
      }
      
      bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
              console.log(err);
          }

          if (isMatch) {
            jwt.sign(
              {
                ...user._doc,
                lastLogin: Date.now
              },
              "20061995",
              (err, token) => {
                if (err) {
                    res.json({ err: err.message });
                } else {
                    const rsa = new NodeRSA({ b: 1024 });
                    const publicKey = rsa.exportKey('public');
                    const privateKey = rsa.exportKey('private');

                    fs.writeFileSync(`keys/${user.id}-public.pem`, publicKey);
                    let keyPath = `keys/${randomString({ length: 32 })}.pem`;
                    fs.writeFileSync(keyPath, privateKey);
                    console.log('private key done');
                    res.json({
                        token,
                        ...user._doc,
                        password: undefined,
                        keyPath: `/api/books/get-key/${keyPath}`
                    });
                }
              }
            );
          } else {
              res.json({ message: 'Email or password incorrect' });
          }
      });
  })
  .catch(err => console.log(err));
});

module.exports = router;