import express from 'express';
import { maths_Numerical, getConcepts, getConceptByKey, AnalysisImage } from '../services/maths_Services.js';
import VerifyToken from '../middleware/index.js';
import History from '../modal/history.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/solve', VerifyToken, async (req, res) => {
    try {
        const { query, marks } = req.body;

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        // Get token from authorization header (VerifyToken ensures it exists)
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        const result = await maths_Numerical(query, marks || 4, token);

        // Map final_answer to answer for history logging if needed
        const displayAnswer = result.answer || result.final_answer;

        if (displayAnswer && typeof displayAnswer === 'string') {
            const cleanedAnswer = displayAnswer.split('[EXAMINER AUDIT:')[0].trim();
            if (result.answer) result.answer = cleanedAnswer;
            if (result.final_answer) result.final_answer = cleanedAnswer;
        }

        // Save to History
        const history = new History({
            username: req.user.email,
            query: query,
            answer: result.final_answer || "No answer provided",
            response: JSON.parse(JSON.stringify(result)),
            marks: marks || 4,
            mode: 'chat'
        });
        await history.save();

        res.json(result);
    } catch (error) {
        console.error('Maths Controller Error:', error);
        res.status(error.response?.status || 500).json({
            message: 'Error interacting with AI',
            error: error.response?.data || error.message
        });
    }
});

router.get('/concepts', VerifyToken, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const result = await getConcepts(token);
        res.json(result);
    } catch (error) {
        console.error('Error fetching concepts:', error);
        res.status(error.response?.status || 500).json({
            message: 'Error fetching concepts',
            error: error.response?.data || error.message
        });
    }
});

router.get('/concepts/:key', VerifyToken, async (req, res) => {
    try {
        const { key } = req.params;
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const result = await getConceptByKey(key, token);
        res.json(result);
    } catch (error) {
        console.error(`Error fetching concept ${req.params.key}:`, error);
        res.status(error.response?.status || 500).json({
            message: `Error fetching concept ${req.params.key}`,
            error: error.response?.data || error.message
        });
    }
});

router.post('/graph_analysis', VerifyToken, upload.any(), async (req, res) => {
    try {
        const imageFile = req.files[0];

        if (!imageFile) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        // Seedha imageFile pass karo
        const result = await AnalysisImage('graph_analysis', token, imageFile);
        
        const displayAnswer = result.answer || result.final_answer;

        if (displayAnswer && typeof displayAnswer === 'string') {
            const cleanedAnswer = displayAnswer.split('[EXAMINER AUDIT:')[0].trim();
            if (result.answer) result.answer = cleanedAnswer;
            if (result.final_answer) result.final_answer = cleanedAnswer;
        }

        const history = new History({
            username: req.user.email,
            query: 'Graph Image Analysis',
            answer: result.final_answer || "No answer provided",
            response: JSON.parse(JSON.stringify(result)),
            marks: 4,
            mode: 'chat'
        });
        await history.save();

        res.json(result);

    } catch (error) {
        console.error('Graph Analysis Controller Error:', error);
        res.status(error.response?.status || 500).json({
            message: 'Error interacting with AI',
            error: error.response?.data || error.message
        });
    }
});

export default router;
