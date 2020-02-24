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

    const fileN = `${slugify(university.fullName+" "+dateTime.getTime().toString())}${ext}`;

    let finalFile = `/uploads/universities/temp/${fileN}`;

    let pathstr = __dirname;
    pathstr = pathstr.substr(0, pathstr.indexOf('/routes'));
    
    file.mv(`${path.join(pathstr, 'public')}${finalFile}`, async (err) => {
      if (err){
          res.send(err.message);
      } else {
        university.tempPhotoUrl = finalFile;
        await university.save();
        const url = getUrl('crop-picture', { id: university._id }, req.app.locals.urls);
        res.redirect(url);
      }
    });
});

module.exports = router;