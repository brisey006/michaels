const URL = require('../models/url');

module.exports = (req, res, next) => {
    URL.find({}).then(urls => {
        req.app.locals.urls = urls;
        next();
    });
};