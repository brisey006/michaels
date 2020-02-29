const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const BookSchema = new mongoose.Schema({
    title: String,
    description: String,
    author: String,
    datePublished: Date,
    coverUrl: String,
    tmpCoverUrl: String,
    rating: {
        count: Number,
        total: Number
    },
    isbn: String,
    bookFileUrl: String,
    publisher: String,
    genre: String
}, {
    timestamps: true
});

BookSchema.plugin(mongoosePaginate);
const Book = mongoose.model('Book', BookSchema);

module.exports = Book;