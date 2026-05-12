import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // not required — Google users won't have a password
    },
    profileImage: {
        type: String,
    },
    googleId: {
        type: String,  // stored when user signs in with Google
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    verificationOtp: {
        type: String,
        default: undefined
    },
    verificationOtpExpiry: {
        type: Number,
        default: undefined
    },
    resetOtp: {
        type: String,
        default: undefined
    },
    resetOtpExpiry: {
        type: Number,
        default: undefined
    },
    isVerified: {
        type: Boolean,
        default: false
    }

},
    {
        timestamps: true
    })

const User = mongoose.model('Users', userSchema);

export default User;
