import express from 'express';
import User from '../modal/user.js';
import Admin from '../modal/admin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { sendOTP } from '../utils/mailer.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'MS_SECRET';
const SuperAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim() ?? '';
const SuperAdminPassword = process.env.SUPER_ADMIN_PASSWORD?.trim() ?? '';

function isSuperAdminLogin(email, password) {
    if (!SuperAdminEmail || !SuperAdminPassword) return false;
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    return (
        normalizedEmail === SuperAdminEmail.toLowerCase() &&
        String(password ?? '') === SuperAdminPassword
    );
}

async function sendVerificationOtp(email, user) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.verificationOtp = otp;
    user.verificationOtpExpiry = Date.now() + 600000; // 10 minutes expiry
    await user.save();

    try {
        await sendOTP(email, otp, 'verification');
    } catch (error) {
        console.error("Failed to send verification email:", error);
        throw new Error('Failed to send verification email');
    }
}

async function sendResetOtp(email, user) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 600000; // 10 minutes expiry
    await user.save();

    try {
        await sendOTP(email, otp, 'reset');
    } catch (error) {
        console.error("Failed to send reset email:", error);
        throw new Error('Failed to send reset email');
    }
}

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
        const newUser = new User({ firstName, lastName, email, password: hashedPassword });
        await newUser.save();

        // send verification otp
        await sendVerificationOtp(email, newUser);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify the OTP sent to your email to activate your account.',
            email: newUser.email
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

        if (isSuperAdminLogin(email, password)) {
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                role: 'super-admin',
            });
        }

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ success: false, message: 'Invalid password' });
            }

            if (!user.isVerified) {
                return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
            }

            const token = jwt.sign(
                { _id: user._id, email: user.email, sub: user.email, role: 'user' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                role: 'user',
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    profileImage: user.profileImage,
                    role: 'user',
                },
                token
            });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isAdminPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isAdminPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign(
            { _id: admin._id, email: admin.email, sub: admin.email, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            role: 'admin',
            user: {
                _id: admin._id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                role: 'admin',
            },
            token
        });



    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
});

// ─── Forgot Password ─────────────────────────────────────────────────────────

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    try {
        await sendResetOtp(email, user);
        res.status(200).json({ success: true, message: 'Password reset OTP sent successfully to your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reset OTP email.' });
    }
});

// ─── Reset Password ──────────────────────────────────────────────────────────

router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // 1. Pehle sirf email se user dhoondo (Bina OTP aur Expiry check kiye)
    const foundUser = await User.findOne({ email });

    // Agar user hi nahi mila
    if (!foundUser) {
        return res.status(404).json({ message: 'User not found!' });
    }

    // 2. Terminal maii values check karo (Debugging)
    console.log("------------------------------");
    console.log("DB mein OTP haii:", foundUser.resetOtp);
    console.log("Aapne bheja haii:", otp);
    console.log("DB Expiry Time:", foundUser.resetOtpExpiry);
    console.log("Abhi ka Time:", Date.now());
    console.log("------------------------------");

    // 3. Ab manual checks lagao taake exact error pata chale
    if (foundUser.resetOtp !== otp) {
        return res.status(400).json({ message: 'Incorrect OTP! Match nahi horaha.' });
    }

    if (foundUser.resetOtpExpiry < Date.now()) {
        return res.status(400).json({ message: 'OTP Expired! Aapne 10 minutes se zyada laga diye.' });
    }

    // 4. Agar sab sahi haii tu password update karo
    foundUser.password = await bcrypt.hash(newPassword, 10);
    foundUser.resetOtp = undefined;
    foundUser.resetOtpExpiry = undefined;
    await foundUser.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
});

// ─── Verify OTP (Signup/Activation) ───────────────────────────────────────────

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'User is already verified' });
        }

        if (user.verificationOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Incorrect OTP' });
        }

        if (user.verificationOtpExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        // Activate user
        user.isVerified = true;
        user.verificationOtp = undefined;
        user.verificationOtpExpiry = undefined;
        await user.save();

        const token = jwt.sign({ _id: user._id, email: user.email, sub: user.email }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully! Your account is now active.',
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
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Resend Verification OTP ─────────────────────────────────────────────────

router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'User is already verified' });
        }

        await sendVerificationOtp(email, user);

        return res.status(200).json({
            success: true,
            message: 'Verification OTP has been resent to your email.'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});


export default router;