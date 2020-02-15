const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const getUrl = require('../config/getUrl');
const enc = require('../config/enc');
const randomString = require('random-string');

const addPageCss = [
    "/assets/libs/jquery-nice-select/nice-select.css",
    "/assets/libs/switchery/switchery.min.css",
    "/assets/libs/multiselect/multi-select.css",
    "/assets/libs/select2/select2.min.css",
    "/assets/libs/bootstrap-touchspin/jquery.bootstrap-touchspin.css",
    "/assets/libs/flatpickr/flatpickr.min.css",
    "/assets/libs/dropify/dropify.min.css"
];

const addPageJs = [
    "/assets/libs/jquery-nice-select/jquery.nice-select.min.js",
    "/assets/libs/switchery/switchery.min.js",
    "/assets/libs/multiselect/jquery.multi-select.js",
    "/assets/libs/select2/select2.min.js",
    "/assets/libs/jquery-mockjax/jquery.mockjax.min.js",
    "/assets/libs/autocomplete/jquery.autocomplete.min.js",
    "/assets/libs/bootstrap-touchspin/jquery.bootstrap-touchspin.min.js",
    "/assets/libs/bootstrap-maxlength/bootstrap-maxlength.min.js",
    "/assets/libs/flatpickr/flatpickr.min.js",
    "/assets/libs/parsleyjs/parsley.min.js",
    "/assets/js/pages/form-advanced.init.js",
    "/assets/libs/flatpickr/flatpickr.min.js",
    "/assets/libs/bootstrap-colorpicker/bootstrap-colorpicker.min.js",
    "/assets/libs/clockpicker/bootstrap-clockpicker.min.js",
    "/assets/js/pages/form-pickers.init.js",
    "/assets/libs/dropify/dropify.min.js",
    "/assets/js/pages/form-fileuploads.init.js"
];

const User = require('../models/user');
const userAction = require('../functions/index').userAction;

/** Get Requests */

router.get('/users/login', (req, res) => {
    res.render('login', { layout: false });
});

router.get('/users/register', (req, res) => {
    res.render('register', { layout: false });
});

router.get('/users/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('token').redirect('/users/login');
    });
});

router.get('/users/add', (req, res) => {
    const countries = require('../data/countries');
    res.render('users/users/add-user', {
        css: addPageCss,
        js: addPageJs,
        countries
    });
});

router.get('/users/list/:userType/:page/:limit', (req, res) => {
    const userType = req.params.userType;
    const page = req.params.page;
    const limit = req.params.limit;
    User.paginate({
        userType: { $ne: 'Super Admin' }
    }, {
        page,
        limit
    }).then(users => {
        const io = req.app.locals.io;
        res.render('users/users/users', { 
            users,
            css: [
                "/assets/libs/sweetalert2/sweetalert2.min.css"
            ],
            js: [
                "/assets/libs/sweetalert2/sweetalert2.min.js",
                "/assets/js/axios.min.js",
                '/assets/js/users.js'
            ]
        });
    }).catch(e => {
        console.log(e);
    });
});

router.get('/users/delete/:id',async (req, res) => {
    const currentUser = req.session.user._id;
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });
    User.deleteOne({ _id: userId }).then(val => {
        userAction(currentUser, 'delete', 'User', user, null)
        .then(() => {
            res.json(val);
        })
        .catch(err => {
            res.json(err);
        });
    }).catch(err => {
        res.json(err);
    });
});

router.get('/users/set-picture/:id', (req, res) => {
    res.render('users/users/set-picture');
});

router.get('/users/edit/:id', async (req, res) => {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId }).select('-password');
    let current_datetime = new Date(user.dateOfBirth);
    let formatted_date = `${current_datetime.getFullYear()}-${current_datetime.getMonth() + 1}-${current_datetime.getDate()}`;
    const countries = require('../data/countries');
    res.render('users/users/edit-user', {
        css: addPageCss,
        js: addPageJs,
        countries,
        userDetails: { ...user._doc, dateOfBirth: formatted_date }
    });
});

router.get('/users/u/:id', (req, res) => {
    const db = req.app.locals.db;
    const id = req.params.id;
    const rtype = req.query.rtype;
});

/** Post Requests */

router.post('/users/add', async (req, res) => {
    const { firstName, lastName, email, physicalAddress, phoneNumber, gender, userType, dateOfBirth, country } = req.body;
    let firstNameError, lastNameError, emailError, physicalAddressError, phoneNumberError, genderError, dateOfBirthError, countryError;

    const currentUser = req.session.user._id;

    if (!firstName) {
        firstNameError = 'Please provide user\'s first name';
    }

    if (!lastName) {
        lastNameError = 'Please provide user\'s last name';
    }

    if (!email) {
        emailError = 'Please provide user email address';
    } else {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){}
        else {
            emailError = 'Please provide a valid email address';
        }
    }

    if (!physicalAddress) {
        physicalAddressError = 'Please provide user\'s physical address';
    }

    if (!phoneNumber) {
        phoneNumberError = 'Please provide user\'s phone number';
    }

    if (!gender) {
        genderError = 'Please choose user\'s gender'
    }

    if (!dateOfBirth) {
        dateOfBirthError = 'Please provide user\'s date of birth';
    }

    if (!country) {
        countryError = 'Please provide user\'s country';
    }

    if (!firstNameError && !lastNameError && !emailError && !phoneNumberError && !dateOfBirthError && !countryError) {
        const fullName = `${firstName} ${lastName}`;
        const password = randomString({ special: true, length: 8 });
        const hashId = enc.encrypt(password);
        const user = new User({ 
            firstName, 
            lastName, 
            fullName, 
            email, 
            physicalAddress, 
            phoneNumber, 
            gender, 
            userType, 
            dateOfBirth, 
            country, 
            password, 
            hashId, 
            createdBy: 
            currentUser 
        });
    
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            
            user.save().then(user => {
                userAction(currentUser, 'create', 'User', null, user._id)
                .then(() => {
                    res.json(user);
                })
                .catch(err => {
                    res.json(err);
                });
            }).catch(err => {
                res.json(err);
            })
        }));
    } else {
        const countries = require('../data/countries');
        res.render('users/users/add-user', {
            css: addPageCss,
            js: addPageJs,
            formData: req.body,
            countries,
            firstNameError, lastNameError, emailError, physicalAddressError, phoneNumberError, genderError, dateOfBirthError, countryError
        });
    }
});

router.post('/users/change-password', (req, res) => {
    const userSession = req.session.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if(!currentPassword || !newPassword || !confirmPassword) {
        res.json({
            status: 'err',
            message: 'Fill in all fields'
        });
    } else {
        if(newPassword.length < 6) {
            res.json({
                status: 'err',
                message: 'Passwords must be 6 or more characters'
            });
        } else {
            if(newPassword !== confirmPassword) {
                res.json({
                    status: 'err',
                    message: 'Passwords do not match'
                });
            } else {
                /*db.collection('users').findOne({ _id: ObjectId(userSession._id) })
                .then(user => {
                    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
                        if (err) {
                            console.log(err);
                        }
    
                        if (isMatch) {
                            bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newPassword, salt, (err, hash) => {
                                if (err) throw err;
                                db.collection('users').updateOne({ email: user.email }, { 
                                    $set: { 
                                        password: hash, 
                                        linkHash: enc.encrypt(newPassword)
                                    } 
                                })
                                .then(data => {
                                    if (data.result.nModified == 1) {
                                        res.json({
                                            status: 'success',
                                            message: 'Your password has been changed'
                                        });
                                    } else {
                                        res.json({
                                            status: 'err',
                                            message: 'An error occured. Try again later'
                                        });
                                    }
                                })
                                .catch(err => {
                                    res.json({ status: 'err', message: err.errmsg });
                                });
                            }));
                        } else {
                            res.json({
                                status: 'err',
                                message: 'Enter correct current password'
                            });
                        }
                    });
                }).catch(err => {
                    throw err;
                });*/
            }
        }
    }
});

router.post('/users/edit/:id', async (req, res) => {
    const id = req.params.id;
    const currentUser = req.session.user._id;
    const before = await User.findOne({_id: id});
    await User.updateOne({ _id: id }, { $set: req.body });
    const after = await User.findOne({_id: id});
    await userAction(currentUser, 'update', 'User', before, after);
    const url = getUrl('users', { page: 1, limit: 20, userType: 'all' }, req.app.locals.urls);
    res.redirect(url);
});

router.post('/users/login', async (req, res, next) => {
    passport.authenticate(
        "local",
        { session: true },
        (err, passportUser, info) => {
          if (err) {
            res.render(`login`, { auth: true, err: err.message, data: req.body, layout: false });
          }
    
          if (passportUser) {
            const user = passportUser;
            const today = new Date();
            const expirationDate = new Date(today);
            expirationDate.setDate(today.getDate() + 60);
    
            jwt.sign(
              {
                email: user.email,
                id: user._id,
                exp: parseInt(expirationDate.getTime() / 1000, 10),
                lastLogin: Date.now
              },
              "20061995",
              (err, token) => {
                if (err) {
                  res.render(`login`, { auth: true, err: err.message, data: req.body, layout: false });
                } else {
                  res.cookie('token', token).redirect('/');
                }
              }
            );
          } else {
            res.render(`login`, { auth: true, err: info.message, data: req.body, layout: false });
          }
        }
      )(req, res, next);
});


module.exports = router;