import express from 'express';
import History from '../modal/history.js';
import VerifyToken from '../middleware/index.js';

const router = express.Router();  

/**
 * @route GET /api/history
 * @desc Get all interaction history for the logged-in user
 * @access Private
 */
router.get('/', VerifyToken, async (req, res) => {
    try {
        const history = await History.find({ username: req.user.email }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch history',
            error: error.message
        });
    }
});

export default router;
