const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    linkId: {
        type: String,
        index: true,
        unique: true
    },
    filePath: String,
}, {
    timestamps: true
});

const Link = mongoose.model('Link', LinkSchema);

module.exports = Link;