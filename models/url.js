const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const URLSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    url: String
}, {
    timestamps: true
});

URLSchema.plugin(mongoosePaginate);
const URL = mongoose.model('URL', URLSchema);

module.exports = URL;