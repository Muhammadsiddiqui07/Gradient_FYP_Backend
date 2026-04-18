import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import upload from '../middleware/upload.js';
import VerifyToken from '../middleware/index.js';

const router = express.Router();

/**
 * @route POST /api/geography/upload
 * @desc Upload an image and forward it to the Python AI service for analysis
 * @access Private
 */
router.post('/geography_theory', VerifyToken, async (req, res) => {
    try {
        const { query = "", marks = 4 } = req.body;

        // 2. Prepare form-data for the Python AI service
        const pythonFormData = new FormData();
        pythonFormData.append('query', query);
        pythonFormData.append('marks', marks.toString());

        console.log(`Forwarding geography theory request to AI service... (Query: "${query}")`);

        // 3. Forward request to Python Backend (localhost:8000)
        const pythonServiceUrl = 'http://localhost:8000/geography/analyze-map';

        const response = await axios.post(pythonServiceUrl, pythonFormData, {
            headers: {
                ...pythonFormData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        // 4. Return the AI results to the frontend
        return res.status(200).json({
            success: true,
            message: 'Analysis completed successfully',
            data: response.data
        });

    } catch (error) {
        console.error('AI Forwarding Error:', error.response?.data || error.message);

        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.detail || error.message;

        return res.status(statusCode).json({
            success: false,
            message: 'Failed to process geography image via AI service',
            error: errorMessage
        });
    }
});

router.post('/Analyze_Image_Question', VerifyToken, upload.any(), async (req, res) => {
    try {
        // 1. Check if files exist (Optional)
        const file = (req.files && req.files.length > 0) ? req.files[0] : null;

        // 2. Prepare form-data for the Python AI service
        const pythonFormData = new FormData();
        
        if (file) {
            pythonFormData.append('image', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });
        }
        
        console.log(`Forwarding image analysis request to AI service... (Image: ${file ? 'Yes' : 'No'})`);

        // 3. Forward request to Python Backend (localhost:8000)
        const pythonServiceUrl = 'http://localhost:8000/geography/analyze-image-question';

        const response = await axios.post(pythonServiceUrl, pythonFormData, {
            headers: {
                ...pythonFormData.getHeaders(),
                // If the Python service needs authorization, add it here
                // 'Authorization': req.headers.authorization 
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        // 4. Return the AI results to the frontend
        return res.status(200).json({
            success: true,
            message: 'Analysis completed successfully',
            data: response.data
        });

    } catch (error) {
        console.error('AI Forwarding Error:', error.response?.data || error.message);

        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.detail || error.message;

        return res.status(statusCode).json({
            success: false,
            message: 'Failed to process geography image via AI service',
            error: errorMessage
        });
    }
});

export default router;
