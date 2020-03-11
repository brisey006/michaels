const express = require('express');
const router = express.Router();
const enc = require('../../config/enc');
const slugify = require('../../functions/index').slugify;
const randomString = require('random-string');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const jwt = require("jsonwebtoken");
const verifyToken = require('../../config/auth').verifyToken;

const Book = require('../../models/book');
const Link = require('../../models/link');
const User = require('../../models/user');

router.get('/books/list/:page/:limit', verifyToken, (req, res) => {
    const page = req.params.page;
    const limit = req.params.limit;
    console.log(req.user);
    Book.paginate({}, {
        page,
        limit,
    }).then(books => {
        res.json(books);
    }).catch(e => {
        console.log(e);
    });
});

router.get('/books/e/:slug', verifyToken, (req, res) => {
    const slug = req.params.slug;
    Book.findOne({ slug })
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

router.get('/books/request-token/:id', verifyToken, async (req, res) => {
    const book = await Book.findOne({ _id: req.params.id });
    const linkId = randomString({ length: 32 });
    await new Link({ filePath: book.bookFileUrl, linkId }).save();
    let publicKeyString;
    const keyPath = `keys/${req.user._id}-public.pem`;
    if (fs.existsSync(keyPath)) {
        let public = fs.readFileSync(keyPath, 'utf8');
        publicKeyString = public;

        let publicKey = new NodeRSA(publicKeyString);

        const encrypted = publicKey.encrypt(linkId, 'base64');
        res.send(encrypted);
        setTimeout(() => {
            Link.deleteOne({ linkId }).then(() => {
                console.log('Link removed');
            });
        }, 5000);
    } else {
        res.sendStatus(403);
    }
});

router.get('/books/get-key/keys/:path', (req, res) => {
    let filePath = 'keys/'+req.params.path;
    let dirPath = __dirname;
    dirPath = dirPath.substring(0, dirPath.lastIndexOf('/'));
    dirPath = dirPath.substring(0, dirPath.lastIndexOf('/'));
    filePath = dirPath+'/'+filePath;
    
    if (fs.existsSync(filePath)) {
        const input = fs.createReadStream(filePath);
        input.pipe(res);
        input.on('end', () => {
            input.close();
            fs.unlinkSync(filePath);
        });
    } else {
        res.send('link expired');
    }
});

router.post('/books/verify-download', verifyToken, (req, res) => {
    jwt.verify(req.body.token, '20061995', (err, data) => {
        if(err) {
          res.sendStatus(403);
        } else {
          res.send(data);
        }
    });
});

router.get('/books/download-book/:id', verifyToken, async (req, res) => {
    
    let pathstr = __dirname;
    pathstr = pathstr.substr(0, pathstr.indexOf('/routes'));
    const book = await Book.findOne({ _id: req.params.id }).populate('createdBy');

    const rsaKey = fs.readFileSync(`${pathstr}/config/.private.pem`, 'utf8');
    let privateKey = new NodeRSA(rsaKey);
    const decrypted = privateKey.decrypt(book.file, 'utf8');
    console.log(decrypted);

    if (fs.existsSync(pathstr+decrypted)) {
        const user = book.createdBy;
        const paas = slugify(`${user.createdAt} ${user._id}`);
        const password = crypto.createHash('md5').update(paas).digest("hex");
        const key = crypto.scryptSync(password, 'salt', 24);
        
        const algorithm = 'aes-192-cbc';
        
        const iv = Buffer.alloc(16, 0);

        const decipher = crypto.createDecipheriv(algorithm, key, iv);

        const input = fs.createReadStream(pathstr+decrypted);
        input.pipe(decipher).pipe(res);
    } else {
        res.send('file not available');
    }
});

module.exports = router;