const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const UniversitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        validate: {
            validator: function(v) {
              return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        },
        required: true,
        unique: true,
    },
    physicalAddress: String,
    phoneNumber: String,
    website: String,
    logoUrl: {
        type: String,
        default: '/assets/images/Universitys/avatar_placeholder.png'
    },
    tempLogoUrl: String,
    librarian: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    country: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

UniversitySchema.plugin(mongoosePaginate);
const University = mongoose.model('University', UniversitySchema);

module.exports = University;