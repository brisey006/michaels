const express = require('express');
const assert = require('assert');
const path = require('path');
const handlebars = require('express-handlebars');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const session = require('express-session');
const helpers = require('handlebars-helpers')();
const mongoose = require('mongoose');

const hbshelpers = require('./config/hbshelpers');
require('./config/passport')(passport);

const app = express();

const port = process.env.PORT || 5000;

app.use(fileUpload());
const hbs = handlebars.create({
    extname: '.hbs',
    helpers: {
        ...helpers,
        ...hbshelpers
    }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ 
    secret: 'tue/20/06/1995', 
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./config/auth')._selfAuth);
app.use(require('./config/urls'));

mongoose.connect('mongodb://localhost:27017/michaels', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
}, () => {
    console.log('Mongo is up!');
});

app.use('/', require('./routes/index'));
app.use('/setup', require('./setup/init'));
app.listen(port, () => {
    console.log(`App running at port ${port}`);
});