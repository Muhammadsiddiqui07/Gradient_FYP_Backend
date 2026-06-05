import express from 'express';
import Admin from '../modal/admin.js';
import bcrypt from 'bcrypt'
import Joi from 'joi'
import User from '../modal/user.js';
import History from '../modal/history.js';

const router = express.Router();

const SuperAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim() ?? '';
const SuperAdminPassword = process.env.SUPER_ADMIN_PASSWORD?.trim() ?? '';

function verifySuperAdminCredentials(createdBy, createdByPass) {
    if (!SuperAdminEmail || !SuperAdminPassword) return false;
    return (
        String(createdBy ?? '').trim().toLowerCase() === SuperAdminEmail.toLowerCase() &&
        String(createdByPass ?? '') === SuperAdminPassword
    );
}

// Simple Joi Schema
const createAdminSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    createdBy: Joi.string().email().required(),
    createdByPass: Joi.string().required()
});

router.post('/create-admin', async (req, res) => {

    // Validation
    const { error } = createAdminSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    const { firstName, lastName, email, password, createdBy, createdByPass } = req.body;

    // Super admin check
    if (!verifySuperAdminCredentials(createdBy, createdByPass)) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized: Invalid super admin credentials'
        });
    }

    try {
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Admin created successfully'
        });

    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create admin'
        });
    }
});

router.get('/list-admins', async (req, res) => {

    const { createdBy, createdByPass } = req.body;


    // Super admin check
    if (!verifySuperAdminCredentials(createdBy, createdByPass)) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized: Invalid super admin credentials'
        });
    }

    try {
        const admins = await Admin.find({}, { password: 0 }); // Exclude password field
        res.status(200).json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admins'
        });
    }
});

router.delete('/delete-admin', async (req, res) => {
    const { createdBy, createdByPass, email } = req.body;

    if (!createdBy || !createdByPass) {
        return res.status(400).json({
            success: false,
            message: 'Missing super admin credentials'
        });
    }

    // Super admin check
    if (!verifySuperAdminCredentials(createdBy, createdByPass)) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized: Invalid super admin credentials'
        });
    }

    try {
        const deletedAdmin = await Admin.findOneAndDelete({ email });

        if (!deletedAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete admin'
        });
    }
});

router.get('/list-users', async (req, res) => {
    const { createdBy, createdByPass } = req.body;

    if (!createdBy || !createdByPass) {
        return res.status(400).json({
            success: false,
            message: 'Missing super admin credentials'
        });
    }

    // Super admin check
    if (!verifySuperAdminCredentials(createdBy, createdByPass)) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized: Invalid super admin credentials'
        });
    }
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password field
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

router.get('/list-history', async (req, res) => {
    const { createdBy, createdByPass } = req.body;
    if (!createdBy || !createdByPass) {
        return res.status(400).json({
            success: false,
            message: 'Missing super admin credentials'
        });
    }
    // Super admin check
    if (!verifySuperAdminCredentials(createdBy, createdByPass)) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized: Invalid super admin credentials'
        });
    }
    try {
        const history = await History.find({});
        res.status(200).json({
            success: true,
            data: history
        });
    }
    catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch history'
        });
    }
});

export default router;