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
    Book.paginate({}, {
        page,
        limit,
    }).then(books => {
        res.json(books);
    }).catch(e => {
        console.log(e);
    });
});

router.get('/books/e/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    Book.findOne({ _id: id })
    .then(book => {
        res.json(book);
    })
    .catch(err => {
        res.send(err);
    });
});

router.get('/books/request-token/:id', verifyToken, async (req, res) => {
    let pathstr = __dirname;
    pathstr = pathstr.substr(0, pathstr.indexOf('/routes'));
    const book = await Book.findOne({ _id: req.params.id });
    
    const rsaKey = fs.readFileSync(`${pathstr}/config/.private.pem`, 'utf8');
    let privateKey = new NodeRSA(rsaKey);
    const paas = privateKey.decrypt(book.signature, 'utf8');

    let publicKeyString;
    const keyPath = `keys/${req.user._id}-public.pem`;
    if (fs.existsSync(keyPath)) {
        let public = fs.readFileSync(keyPath, 'utf8');
        publicKeyString = public;

        let publicKey = new NodeRSA(publicKeyString);

        const encrypted = publicKey.encrypt(paas, 'base64');
        res.send(encrypted);
    } else {
        res.sendStatus(403);
    }
});

router.get('/books/get-private/keys/:path', (req, res) => {
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

router.get('/books/get-public/keys', (req, res) => {
    let pathstr = __dirname;
    pathstr = pathstr.substr(0, pathstr.indexOf('/routes'));
    const path = `${pathstr}/config/.public.pem`;
    if (fs.existsSync(path)) {
        const input = fs.createReadStream(path);
        input.pipe(res);
        input.on('end', () => {
            input.close();
        });
    } else {
        res.sendStatus(403);
    }
});

router.post('/books/download-book/:id', verifyToken, async (req, res) => {
    console.log(req.body);
    
    let pathstr = __dirname;
    pathstr = pathstr.substr(0, pathstr.indexOf('/routes'));
    const book = await Book.findOne({ _id: req.params.id }).populate('createdBy');

    try {
        const rsaKey = fs.readFileSync(`${pathstr}/config/.private.pem`, 'utf8');
        let privateKey = new NodeRSA(rsaKey);
        const decrypted = privateKey.decrypt(book.file, 'utf8');
        if (fs.existsSync(pathstr+decrypted)) {
            const paas = privateKey.decrypt(req.body.file, 'utf8');
            console.log(paas);
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
    } catch (e) {
        console.log('error occured');
    }
});

module.exports = router;