const jwt = require("jsonwebtoken");
const User = require('../models/user');

const _selfAuth = (req, res, next) => {
  if (req.url == '/users/login' || req.url == '/users/register' || req.url.indexOf('/setup') > -1) {
    next();
  } else {
    if (req.session.user == undefined) {
      if (req.cookies.token !== undefined) {
        jwt.verify(req.cookies.token, "20061995", async (err, authData) => {
          if (err) {
            res.redirect('/users/login');
          } else {
            User.findOne({ email: authData.email }).then(user => {
              req.session.user = user;
              res.locals.user = req.session.user;
              next();
            }).catch(e => {
              throw e;
            });
          }
        });
      } else {
        res.redirect('/users/login');
      }
    } else {
      res.locals.user = req.session.user;
      next();
    }
  }
}

module.exports = {
  _selfAuth
}