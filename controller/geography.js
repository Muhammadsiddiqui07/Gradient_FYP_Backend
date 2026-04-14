import express from 'express';
import geographyRouter from '../services/Geography_images.js';

const router = express.Router();

// Base path is /api/geography
router.use('/', geographyRouter);

export default router;
