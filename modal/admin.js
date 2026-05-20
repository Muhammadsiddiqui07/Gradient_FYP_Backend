import mongoose from "mongoose";

const { Schema } = mongoose;

const adminSchema = new Schema({
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

},
    {
        timestamps: true
    })

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
