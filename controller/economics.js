import express from 'express';
import { economics_Paper_One, economics_Paper_Two } from '../services/economics.js';
import VerifyToken from '../middleware/index.js';
import History from '../modal/history.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/economics_paper_one', VerifyToken, upload.any(), async (req, res) => {
    try {
        const { query } = req.body;
        const imageFile = req.files?.length > 0 ? req.files[0] : null;

        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        const result = await economics_Paper_One({
            query: query?.trim() || '',
            imageFile,
            token,
        });

        const displayAnswer = result.answer || result.final_answer;

        if (displayAnswer && typeof displayAnswer === 'string') {
            const cleanedAnswer = displayAnswer.split('[EXAMINER AUDIT:')[0].trim();
            if (result.answer) result.answer = cleanedAnswer;
            if (result.final_answer) result.final_answer = cleanedAnswer;
        }

        const historyQuery = query?.trim()
            || (imageFile ? 'Economics image analysis' : 'Economics question');

        const history = new History({
            username: req.user.email,
            query: historyQuery,
            answer: result.final_answer || result.answer || 'No answer provided',
            response: JSON.parse(JSON.stringify(result)),
            mode: 'economics',
        });
        await history.save();

        res.json(result);
    } catch (error) {
        console.error('Economics Controller Error:', error);
        res.status(error.response?.status || 500).json({
            message: 'Error interacting with AI',
            error: error.response?.data || error.message,
        });
    }
});

router.post('/economics_paper_two', VerifyToken, upload.any(), async (req, res) => {
    try {
        const { query, section } = req.body;
        const imageFiles = req.files || [];
        const normalizedSection = section?.trim()?.toUpperCase();

        if (!normalizedSection || !['A', 'B'].includes(normalizedSection)) {
            return res.status(400).json({ message: 'Section is required and must be A or B' });
        }

        if (normalizedSection === 'A') {
            if (imageFiles.length === 0) {
                return res.status(400).json({ message: 'Section A requires at least 1 image (max 3)' });
            }
            if (imageFiles.length > 3) {
                return res.status(400).json({ message: 'Section A accepts at most 3 images' });
            }
        } else {
            const hasQuery = !!query?.trim();
            const hasImage = imageFiles.length > 0;

            if (!hasQuery && !hasImage) {
                return res.status(400).json({ message: 'Section B requires query or 1 image' });
            }
            if (imageFiles.length > 1) {
                return res.status(400).json({ message: 'Section B accepts at most 1 image' });
            }
        }

        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        const result = await economics_Paper_Two({
            section: normalizedSection,
            query: query?.trim() || '',
            imageFiles,
            token,
        });

        const historyQuery = query?.trim()
            || `Economics Paper 2 Section ${normalizedSection}${imageFiles.length ? ` (${imageFiles.length} image(s))` : ''}`;

        const history = new History({
            username: req.user.email,
            query: historyQuery,
            answer: result.final_answer || result.answer || JSON.stringify(result) || 'No answer provided',
            response: JSON.parse(JSON.stringify(result)),
            mode: 'economics',
        });
        await history.save();

        res.json(result);
    } catch (error) {
        console.error('Economics Paper Two Controller Error:', error);
        res.status(error.response?.status || 500).json({
            message: 'Error interacting with AI',
            error: error.response?.data || error.message,
        });
    }
});


export default router;
