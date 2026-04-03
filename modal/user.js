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
    otp: {
        type: String,
        default: undefined
    },
    otpExpiry: {
        type: Number,
        default: undefined
    }




},
    {
        timestamps: true
    })

const User = mongoose.model('User', userSchema);

export default User;
