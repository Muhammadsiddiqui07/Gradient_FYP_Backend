import 'dotenv/config';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../modal/user.js';

export const generateToken = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not set.');
        }

        // Connect to DB if not already connected
        if (mongoose.connection.readyState === 0) {
            // Identified as 'test' from checkDB.js
            await mongoose.connect(MONGO_URI, { dbName: 'test' });
        }
        
        const user = await User.findOne();
        if (!user) {
            throw new Error('No users found in database.');
        }

        const secret = process.env.JWT_SECRET || 'MS_SECRET';
        // Python expects 'sub' for username. We'll use email as sub for compatibility.
        const token = jwt.sign({ _id: user._id, email: user.email, sub: user.email }, secret, { expiresIn: '7d' });

        return token;
    } catch (error) {
        console.error('Error in generateToken:', error.message);
        throw error;
    }
};

export default generateToken;
