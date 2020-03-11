const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    next();
  } else {
    res.redirect('/users/login');
  }
}

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  
  if(typeof bearerHeader !== 'undefined') {
    let bearerToken;
    if (bearerHeader.indexOf(' ') > -1) {
      const bearer = bearerHeader.split(' ');
      bearerToken = bearer[1];
    } else {
      bearerToken = bearerHeader;
    }
    
    jwt.verify(bearerToken, '20061995', (err, authData) => {
      if(err) {
        res.sendStatus(403);
      } else {
        req.user = authData;
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }

}

module.exports = {
  ensureAuthenticated,
  verifyToken
}