const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const downlodedBooks = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    link: String
});

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    fullName: String,
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
    password: {
        type: String,
        required: true
    },
    physicalAddress: String,
    phoneNumber: String,
    photoUrl: {
        type: String,
        default: '/assets/images/users/avatar_placeholder.png'
    },
    tempPhotoUrl: String,
    gender: String,
    userType: String,
    hashId: String,
    dateOfBirth: Date,
    country: String,
    temporaryPassword: {
        type: Boolean,
        default: true
    },
    downloadedBooks: downlodedBooks,
    publicKey: String,
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

UserSchema.plugin(mongoosePaginate);
const User = mongoose.model('User', UserSchema);

module.exports = User;