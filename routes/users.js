const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const getUrl = require('../config/getUrl');
const enc = require('../config/enc');
const slugify = require('../functions/index').slugify;
const randomString = require('random-string');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

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
        res.clearCookie('token').render('logout', { layout: false });
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
                "/assets/js/users.js",
                "/assets/js/pagination.js"
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
    const setup = req.query.setup;
    User.findOne({ _id: req.params.id })
    .then(userData => {
        res.render('users/users/set-picture', {
            setup,
            userData,
            css: [
                "/assets/libs/dropify/dropify.min.css"
            ],
            js: [
                "/assets/libs/dropify/dropify.min.js",
                "/assets/js/pages/form-fileuploads.init.js"
            ]
        });
    })
    .catch(err => {
        console.log(err);
    });
});

router.get('/users/crop-picture/:id', (req, res) => {
    User.findOne({ _id: req.params.id })
    .then(user => {
        res.render('users/users/crop-picture', {
            userDetails: user,
            css: [
                "/assets/css/croppr.css"
            ],
            js: [
                "/assets/js/axios.min.js",
                "/assets/js/croppr.min.js",
                "/assets/js/image.blob.js",
                "/assets/js/user.image.cropper.js"
            ]
        });
    })
    .catch(err => {
        res.json(err);
    });
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

router.get('/users/profile/e/:id', (req, res) => {
    const id = req.params.id;
    User.findOne({ _id: id })
    .then(userData => {
        res.render('users/users/user', { userData });
    })
    .catch(err => {
        res.send(err);
    });
});

/** Post Requests */

router.post('/users/add', async (req, res) => {
    const { firstName, lastName, email, physicalAddress, phoneNumber, gender, userType, dateOfBirth, country } = req.body;
    let firstNameError, lastNameError, emailError, physicalAddressError, phoneNumberError, genderError, userTypeError, dateOfBirthError, countryError;

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

    if (!userType) {
        userTypeError = 'Please select user\'s type'
    }

    if (!dateOfBirth) {
        dateOfBirthError = 'Please provide user\'s date of birth';
    }

    if (!country) {
        countryError = 'Please provide user\'s country';
    }

    if (!firstNameError && !lastNameError && !emailError && !genderError && !userTypeError && !phoneNumberError && !dateOfBirthError && !countryError) {
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
                    const url = getUrl('set-picture', { id: user._id }, req.app.locals.urls);
                    res.redirect(`${url}?setup=true`);
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
            firstNameError, lastNameError, emailError, physicalAddressError, phoneNumberError, genderError, userTypeError, dateOfBirthError, countryError
        });
    }
});

router.post('/users/set-picture/:id', async (req, res) => {
    
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const user = await User.findOne({ _id: req.params.id });

    let file = req.files.file;
    let fileName = req.files.file.name;
    let ext = path.extname(fileName);

    let dateTime = new Date(user.createdAt);

    const fileN = `${slugify(user.fullName+" "+dateTime.getTime().toString())}${ext}`;

    let finalFile = `/uploads/users/temp/${fileN}`;

    let pathstr = __dirname;
    pathstr = pathstr.substr(0, pathstr.indexOf('/routes'));
    
    file.mv(`${path.join(pathstr, 'public')}${finalFile}`, async (err) => {
      if (err){
          res.send(err.message);
      } else {
        user.tempPhotoUrl = finalFile;
        await user.save();
        const url = getUrl('crop-picture', { id: user._id }, req.app.locals.urls);
        res.redirect(url);
      }
    });
});

router.post('/users/crop-picture/:id', async (req, res) => {
    
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const user = await User.findOne({ _id: req.params.id });
    let dateTime = new Date(user.createdAt);

    let file = req.files.file;
    let ext = '.jpeg';
    const fileN = `${slugify(user.fullName+" "+dateTime.getTime().toString())}${ext}`;
    let finalFile = `/uploads/users/thumbs/${fileN}`;

    let pathstr = __dirname;
    pathstr = pathstr.substr(0, pathstr.indexOf('/routes'));

    file.mv(`${path.join(pathstr, 'public')}${finalFile}`, async (err) => {
      if (err){
          res.send(err.message);
      } else {
        const image = sharp(`${path.join(pathstr, 'public')}${finalFile}`);
        image
            .metadata()
            .then(function(metadata) {
            return image
            .resize({
                width: 300,
                height: 300,
                fit: sharp.fit.cover,
                position: sharp.strategy.entropy
                })
                .webp()
                .toBuffer();
            })
            .then(data => {
                fs.writeFile(`${path.join(pathstr, 'public')}${finalFile}`, data, async (err) => {
                    if(err) {
                        return console.log(err);
                    }
                    user.photoUrl = finalFile;
                    await user.save();
                    res.send(user);
                });
            }).catch(err => {
                console.log(err);
                res.json({err: err});
            });
        }
    });
});

router.post('/users/edit/:id', async (req, res) => {
    const id = req.params.id;
    const currentUser = req.session.user._id;
    const before = await User.findOne({_id: id});
    const data = { ...req.body, fullName: `${req.body.firstName} ${req.body.lastName}` };
    await User.updateOne({ _id: id }, { $set: data });
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