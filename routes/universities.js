const express = require('express');
const router = express.Router();
const getUrl = require('../config/getUrl');
const enc = require('../config/enc');
const slugify = require('../functions/index').slugify;
const randomString = require('random-string');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const University = require('../models/university');
const User = require('../models/user');
const userAction = require('../functions/index').userAction;

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

router.get('/universities/add', (req, res) => {
    const countries = require('../data/countries');
    res.render('universities/add-university', {
        css: addPageCss,
        js: addPageJs,
        countries
    });
});

router.get('/universities/set-picture/:id', (req, res) => {
    const setup = req.query.setup;
    University.findOne({ _id: req.params.id })
    .then(universityData => {
        res.render('universities/set-picture', {
            setup,
            universityData,
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

router.get('/universities/crop-picture/:id', (req, res) => {
    University.findOne({ _id: req.params.id })
    .then(university => {
        res.render('universities/crop-picture', {
            universityData: university,
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

router.get('/universities/list/:page/:limit', (req, res) => {
    const page = req.params.page;
    const limit = req.params.limit;
    University.paginate({}, {
        page,
        limit,
        populate: 'librarian'
    }).then(universities => {
        res.render('universities/universities', { 
            universities,
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

router.get('/universities/e/:id', (req, res) => {
    const id = req.params.id;
    University.findOne({ _id: id }).populate('librarian')
    .then(universityData => {
        res.render('universities/university', { 
            universityData,
            css: [
                "/assets/css/custom.css",
                "/assets/libs/sweetalert2/sweetalert2.min.css"
            ],
            js: [
                "/assets/js/axios.min.js",
                "/assets/libs/sweetalert2/sweetalert2.min.js",
                "/assets/js/add.librarian.search.js",
                "/assets/js/university.js"
            ]
        });
    })
    .catch(err => {
        res.send(err);
    });
});

router.get('/universities/librarian/search', (req, res) => {
    const q = req.query.q;
    var re = new RegExp(q,"gi");
    User.find({ fullName: re, userType: 'Librarian', university: null }).limit(5).then(docs => {
        res.json(docs);
    }).catch(err => {
        console.log(err);
    });
});

router.get('/universities/:id/add-librarian/:user', async (req, res) => {
    const { id, user } = req.params;
    await University.updateOne({ _id: id }, { $set: { librarian: user } });
    await User.updateOne({ _id: user }, { $set: { university: id } });
    const u = await User.findOne({ _id: user }).select('-password');
    res.json(u);
});

router.get('/universities/:id/remove-librarian/:user', async (req, res) => {
    const { id, user } = req.params;
    await University.updateOne({ _id: id }, { $set: { librarian: null } });
    const e = await User.updateOne({ _id: user }, { $set: { university: null } });
    res.json({ status: e });
});

/** POST ROUTES */

router.post('/universities/add', async (req, res) => {
    const { name, email, physicalAddress, phoneNumber, website, country } = req.body;
    let nameError, emailError, physicalAddressError, phoneNumberError, countryError;

    const currentUser = req.session.user._id;

    if (!name) {
        nameError = 'Please provide university name';
    }

    if (!email) {
        emailError = 'Please provide university email address';
    } else {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){}
        else {
            emailError = 'Please provide a valid email address';
        }
    }

    if (!physicalAddress) {
        physicalAddressError = 'Please provide university\'s physical address';
    }

    if (!phoneNumber) {
        phoneNumberError = 'Please provide university\'s main phone number';
    }

    if (!country) {
        countryError = 'Please provide university\'s country';
    }

    if (!nameError && !emailError && !phoneNumberError && !physicalAddressError && !countryError) {
        const university = new University({ name, email, physicalAddress, phoneNumber, website, country });
        university.save().then(university => {
            userAction(currentUser, 'create', 'University', null, university._id)
            .then(() => {
                const url = getUrl('set-university-logo', { id: university._id }, req.app.locals.urls);
                res.redirect(`${url}?setup=true`);
            })
            .catch(err => {
                console.log(err);
                res.json(err);
            });
        }).catch(err => {
            console.log(err);
            res.json(err);
        })

    } else {
        const countries = require('../data/countries');
        res.render('universities/add-university', {
            css: addPageCss,
            js: addPageJs,
            formData: req.body,
            countries,
            nameError, emailError, physicalAddressError, phoneNumberError, countryError
        });
    }
});

router.post('/universities/set-picture/:id', async (req, res) => {
    
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const university = await University.findOne({ _id: req.params.id });

    let file = req.files.file;
    let fileName = req.files.file.name;
    let ext = path.extname(fileName);

    let dateTime = new Date(university.createdAt);

    const fileN = `${slugify(university.name+" "+dateTime.getTime().toString())}${ext}`;

    let finalFile = `/uploads/universities/temp/${fileN}`;

    let pathstr = __dirname;
    pathstr = pathstr.substr(0, pathstr.indexOf('/routes'));
    
    file.mv(`${path.join(pathstr, 'public')}${finalFile}`, async (err) => {
      if (err){
          res.send(err.message);
      } else {
        university.tempLogoUrl = finalFile;
        await university.save();
        const url = getUrl('crop-university-logo', { id: university._id }, req.app.locals.urls);
        res.redirect(url);
      }
    });
});

router.post('/universities/crop-picture/:id', async (req, res) => {
    
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const university = await University.findOne({ _id: req.params.id });
    let dateTime = new Date(university.createdAt);

    let file = req.files.file;
    let ext = '.jpg';
    const fileN = `${slugify(university.name+" "+dateTime.getTime().toString())}${ext}`;
    let finalFile = `/uploads/universities/thumbs/${fileN}`;

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
                    university.logoUrl = finalFile;
                    await university.save();
                    res.send(university);
                });
            }).catch(err => {
                console.log(err);
                res.json({err: err});
            });
        }
    });
});

module.exports = router;