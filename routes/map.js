import express from 'express';
import { analyzeMap } from '../services/mapService.js';
import VerifyToken from '../middleware/index.js';

const router = express.Router();

router.get('/', VerifyToken, async (req, res) => {
    try {
        const { query } = req.query;
        console.log(query ? query : 'No query parameter');
        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }

        // Get token from authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        const result = await analyzeMap(query, token);
        res.json(result);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error analyzing map',
            error: error.response?.data || error.message
        });
    }
});

export default router;
