import express from 'express';
import Admin from '../modal/admin.js';
import bcrypt from 'bcrypt';
import Joi from 'joi';
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

// ================= CREATE ADMIN =================
const createAdminSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    createdBy: Joi.string().email().required(),
    createdByPass: Joi.string().required()
});

router.post('/create-admin', async (req, res) => {
    const { error } = createAdminSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    const { firstName, lastName, email, password, createdBy, createdByPass } = req.body;

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

// ================= LIST ADMINS =================
router.get('/list-admins', async (req, res) => {

    try {
        const [admins, totalAdmins] = await Promise.all([
            Admin.find({}, { password: 0 }),
            Admin.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            total: totalAdmins,
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

// ================= DELETE ADMIN =================
router.delete('/delete-admin/:email', async (req, res) => {
    const email = req.params.email;

    try {

        const cleanedEmail = email.trim();

        const deletedAdmin = await Admin.findOneAndDelete({ email: cleanedEmail });

        if (!deletedAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Admin nahi mila! Kindly email check karein ke database me exist karti hai ya nahi.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Admin deleted successfully',
            data: deletedAdmin
        });

    } catch (error) {
        console.error('Error deleting admin:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete admin'
        });
    }
});
// ================= LIST USERS =================
router.get('/list-users', async (req, res) => {

    try {
        const [users, totalUsers] = await Promise.all([
            User.find({}, { password: 0 }),
            User.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            total: totalUsers,
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

// ================= LIST HISTORY =================
router.get('/list-history', async (req, res) => {

    try {
        const [history, totalHistory] = await Promise.all([
            History.find({}),
            History.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            total: totalHistory,
            data: history
        });

    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch history'
        });
    }
});

export default router;