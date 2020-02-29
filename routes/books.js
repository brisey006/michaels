const express = require('express');
const router = express.Router();
const getUrl = require('../config/getUrl');
const enc = require('../config/enc');
const slugify = require('../functions/index').slugify;
const randomString = require('random-string');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const Book = require('../models/book');
const User = require('../models/user');
const userAction = require('../functions/index').userAction;

const addPageCss = [
    "/assets/libs/jquery-nice-select/nice-select.css",
    "/assets/libs/switchery/switchery.min.css",
    "/assets/libs/multiselect/multi-select.css",
    "/assets/libs/select2/select2.min.css",
    "/assets/libs/bootstrap-touchspin/jquery.bootstrap-touchspin.css",
    "/assets/libs/bootstrap-datepicker/bootstrap-datepicker.min.css",
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
    "/assets/libs/parsleyjs/parsley.min.js",
    "/assets/libs/bootstrap-datepicker/bootstrap-datepicker.min.js",
    "/assets/libs/dropify/dropify.min.js",
    "/assets/js/pages/form-fileuploads.init.js"
];

router.get('/books/add', (req, res) => {
    res.render('books/add-book', {
        css: addPageCss,
        js: addPageJs,
    });
});

router.get('/books/set-picture/:id', (req, res) => {
    const setup = req.query.setup;
    Book.findOne({ _id: req.params.id })
    .then(book => {
        res.render('books/set-picture', {
            setup,
            book,
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

router.get('/books/crop-picture/:id', (req, res) => {
    Book.findOne({ _id: req.params.id })
    .then(book => {
        res.render('books/crop-picture', {
            book,
            css: [
                "/assets/css/croppr.css"
            ],
            js: [
                "/assets/js/axios.min.js",
                "/assets/js/croppr.min.js",
                "/assets/js/image.blob.js",
                "/assets/js/book.cover.croppr.js"
            ]
        });
    })
    .catch(err => {
        res.json(err);
    });
});

router.get('/books/upload-book/:id', (req, res) => {
    const setup = req.query.setup;
    Book.findOne({ _id: req.params.id })
    .then(book => {
        res.render('books/upload-book', {
            setup,
            book,
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

router.get('/books/list/:page/:limit', (req, res) => {
    const page = req.params.page;
    const limit = req.params.limit;
    Book.paginate({}, {
        page,
        limit,
    }).then(books => {
        res.render('books/books', { 
            books,
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

router.get('/books/e/:id', (req, res) => {
    const id = req.params.id;
    Book.findOne({ _id: id })
    .then(book => {
        res.render('books/book', { 
            book,
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

router.get('/books/librarian/search', (req, res) => {
    const q = req.query.q;
    var re = new RegExp(q,"gi");
    User.find({ fullName: re, userType: 'Librarian', university: null }).limit(5).then(docs => {
        res.json(docs);
    }).catch(err => {
        console.log(err);
    });
});

router.get('/books/:id/add-librarian/:user', async (req, res) => {
    const { id, user } = req.params;
    await University.updateOne({ _id: id }, { $set: { librarian: user } });
    await User.updateOne({ _id: user }, { $set: { university: id } });
    const u = await User.findOne({ _id: user }).select('-password');
    res.json(u);
});

router.get('/books/:id/remove-librarian/:user', async (req, res) => {
    const { id, user } = req.params;
    await University.updateOne({ _id: id }, { $set: { librarian: null } });
    const e = await User.updateOne({ _id: user }, { $set: { university: null } });
    res.json({ status: e });
});

/** POST ROUTES */

router.post('/books/add', async (req, res) => {
    const { title, author, publisher, isbn, yearPublished, genre } = req.body;
    let titleError, authorError, publisherError, isbnError, yearPublishedError, genreError;

    const currentUser = req.session.user._id;

    if (!title) {
        titleError = 'Please provide book title';
    }

    if (!author) {
        authorError = 'Please provide author\'s name';
    }

    if (!publisher) {
        publisherError = 'Please provide the publisher';
    }

    if (!isbn) {
        isbnError = 'Please provide ISBN';
    }

    if (!yearPublished) {
        yearPublishedError = 'Please provide year published';
    }

    if (!genre) {
        genreError = 'Please provide book genre';
    }

    if (!titleError && !authorError && !publisherError && !isbnError && !yearPublishedError && !genreError) {
        const book = new Book({ title, author, publisher, isbn, yearPublished, genre });
        book.save().then(book => {
            userAction(currentUser, 'create', 'Book', null, book._id)
            .then(() => {
                const url = getUrl('set-book-cover', { id: book._id }, req.app.locals.urls);
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
        res.render('books/add-book', {
            css: addPageCss,
            js: addPageJs,
            formData: req.body,
            titleError, authorError, publisherError, isbnError, yearPublishedError
        });
    }
});

router.post('/books/set-picture/:id', async (req, res) => {
    
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const book = await Book.findOne({ _id: req.params.id });

    let file = req.files.file;
    let fileName = req.files.file.name;
    let ext = path.extname(fileName);

    let dateTime = new Date(book.createdAt);

    const fileN = `${slugify(book.title+" "+dateTime.getTime().toString())}${ext}`;

    let finalFile = `/uploads/books/covers/temp/${fileN}`;

    let pathstr = __dirname;
    pathstr = pathstr.substr(0, pathstr.indexOf('/routes'));
    
    file.mv(`${path.join(pathstr, 'public')}${finalFile}`, async (err) => {
      if (err){
          res.send(err.message);
      } else {
        book.tmpCoverUrl = finalFile;
        await book.save();
        const url = getUrl('crop-book-cover', { id: book._id }, req.app.locals.urls);
        res.redirect(url);
      }
    });
});

router.post('/books/crop-picture/:id', async (req, res) => {
    
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const book = await Book.findOne({ _id: req.params.id });
    let dateTime = new Date(book.createdAt);

    let file = req.files.file;
    let ext = '.jpg';
    const fileN = `${slugify(book.title+" "+dateTime.getTime().toString())}${ext}`;
    let finalFile = `/uploads/books/covers/original/${fileN}`;

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
                height: 150,
                })
                .webp()
                .toBuffer();
            })
            .then(data => {
                fs.writeFile(`${path.join(pathstr, 'public')}${finalFile}`, data, async (err) => {
                    if(err) {
                        return console.log(err);
                    }
                    book.coverUrl = finalFile;
                    await book.save();
                    res.send(book);
                });
            }).catch(err => {
                console.log(err);
                res.json({err: err});
            });
        }
    });
});

router.post('/books/upload-book/:id', async (req, res) => {
    
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const book = await Book.findOne({ _id: req.params.id });

    let file = req.files.file;
    let fileName = req.files.file.name;
    let ext = path.extname(fileName);

    let dateTime = new Date(book.createdAt);

    const fileN = `${slugify(book.title+" "+dateTime.getTime().toString())}${ext}`;

    let finalFile = `/uploads/books/files/${fileN}`;

    let pathstr = __dirname;
    pathstr = pathstr.substr(0, pathstr.indexOf('/routes'));
    
    file.mv(`${path.join(pathstr, 'public')}${finalFile}`, async (err) => {
      if (err){
          res.send(err.message);
      } else {
        book.bookFileUrl = finalFile;
        await book.save();
        const url = getUrl('book', { id: book._id }, req.app.locals.urls);
        res.redirect(url);
      }
    });
});

module.exports = router;