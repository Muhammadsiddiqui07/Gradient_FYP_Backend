import express from 'express';
import User from '../modal/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'MS_SECRET';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── Validation Schemas ───────────────────────────────────────────────────────

const signupSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});


// ─── Signup ───────────────────────────────────────────────────────────────────

router.post('/signup', async (req, res) => {
    try {
        await signupSchema.validateAsync(req.body);

        const { firstName, lastName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ firstName, lastName, email, password: hashedPassword, authProvider: 'local' });
        await newUser.save();

        const token = jwt.sign({ _id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                profileImage: newUser.profileImage,
            },
            token
        });

    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
});


// ─── Login ────────────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
    try {
        await loginSchema.validateAsync(req.body);
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.authProvider === 'google') {
            return res.status(400).json({ success: false, message: 'This account uses Google Sign-In. Please login with Google.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profileImage: user.profileImage,
            },
            token
        });

    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
});


//─── Google OAuth (Token from Frontend) ──────────────────────────────────────
// Frontend sends the Google ID token, backend verifies it using google-auth-library.

router.post('/google-auth', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: 'Google ID Token is required' });
        }

        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: profileImage } = payload;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // Update existing user with Google ID if not already present
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                await user.save();
            }
        } else {
            // Create new user from Google data
            user = new User({
                firstName: firstName || 'Google',
                lastName: lastName || 'User',
                email,
                googleId,
                profileImage,
                authProvider: 'google',
            });
            await user.save();
        }

        const token = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            success: true,
            message: 'Google login successful',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profileImage: user.profileImage,
            },
            token
        });

    } catch (err) {
        console.error('Google Auth Error:', err);
        return res.status(401).json({ success: false, message: 'Invalid Google Token' });
    }
});


export default router;
