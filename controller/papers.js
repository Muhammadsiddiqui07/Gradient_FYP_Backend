import express from 'express';
import { getPapersData } from '../services/aiService.js';
import VerifyToken from '../middleware/index.js';

const router = express.Router();

/**
 * Route: GET /api/papers/:subject/years
 */
router.get('/:subject/years', VerifyToken, async (req, res) => {
    try {
        const { subject } = req.params;
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        const result = await getPapersData(`/papers/${subject}/years`, token);
        res.json(result);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error fetching paper years',
            error: error.response?.data || error.message
        });
    }
});

/**
 * Route: GET /api/papers/:subject/:year
 */
router.get('/:subject/:year', VerifyToken, async (req, res) => {
    try {
        const { subject, year } = req.params;
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        const result = await getPapersData(`/papers/${subject}/${year}`, token);
        res.json(result);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error fetching paper sessions',
            error: error.response?.data || error.message
        });
    }
});

/**
 * Route: GET /api/papers/:subject/:year/:session
 */
router.get('/:subject/:year/:session', VerifyToken, async (req, res) => {
    try {
        const { subject, year, session } = req.params;
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        const result = await getPapersData(`/papers/${subject}/${year}/${session}`, token);
        res.json(result);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error fetching paper content',
            error: error.response?.data || error.message
        });
    }
});

export default router;
