import express from 'express';
import { askAi, analyzeWeakness } from '../services/aiService.js';
import VerifyToken from '../middleware/index.js';

const router = express.Router();

/**
 * Route: POST /api/ai/ask-ai
 * Purpose: Asks a question to the LLM examiner.
 */
router.post('/ask-ai', VerifyToken, async (req, res) => {
    try {
        const { query, marks } = req.body;
        
        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        // Get token from authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        const result = await askAi(query, marks || 4, token);
        res.json(result);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error interacting with AI',
            error: error.response?.data || error.message
        });
    }
});

/**
 * Route: GET /api/ai/analyze-weakness
 * Purpose: Performs a weakness analysis on user's recent interactions.
 */
router.get('/analyze-weakness', VerifyToken, async (req, res) => {
    try {
        // Get token from authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        const result = await analyzeWeakness(token);
        res.json(result);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error analyzing weakness',
            error: error.response?.data || error.message
        });
    }
});

export default router;
