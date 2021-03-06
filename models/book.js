const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const BookSchema = new mongoose.Schema({
    title: String,
    description: String,
    author: String,
    year: Number,
    coverUrl: String,
    tmpCoverUrl: String,
    rating: {
        count: Number,
        total: Number
    },
    file: String,
    signature: String,
    publisher: String,
    genre: String,
    slug: {
        type: String,
        unique: true
    },
    size: Number,
    downloads: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

BookSchema.plugin(mongoosePaginate);
const Book = mongoose.model('Book', BookSchema);

module.exports = Book;