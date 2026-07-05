import express from 'express';
import { analyzeImageQuestion } from '../services/history_Sources.js';
import VerifyToken from '../middleware/index.js';
import upload from '../middleware/upload.js';
import History from '../modal/history.js';

const router = express.Router();

/**
 * @route POST /api/history-sources/analyze-image-question
 * @desc Analyze a history source image via Python AI service
 * @access Private
 */
router.post('/analyze-image-question', VerifyToken, upload.any(), async (req, res) => {
    try {
        const { query = "", marks } = req.body;
        const file = req.files && req.files.length > 0 ? req.files[0] : null;

        if (!file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }

        // Get token from authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.split(' ')[1] : null;

        const result = await analyzeImageQuestion(file.buffer, query, marks, token);

        // Save to History
        const history = new History({
            username: req.user.email,
            query: query || "Image analysis request",
            answer: result.answer || "No answer provided",
            response: JSON.parse(JSON.stringify(result)),
            marks: marks || 5,
            mode: 'history'
        });
        await history.save();

        return res.status(200).json({
            success: true,
            message: 'Analysis completed successfully',
            data: result
        });
    } catch (error) {
        console.error('History Sources Controller Error:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.detail || error.message;

        return res.status(statusCode).json({
            success: false,
            message: 'Failed to process history source image via AI service',
            error: errorMessage
        });
    }
});

export default router;
