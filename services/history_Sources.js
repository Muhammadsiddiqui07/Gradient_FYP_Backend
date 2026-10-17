import FormData from 'form-data';
import pythonApi from './pythonApi.js';

/**
 * Analyzes a history source image with an optional query and marks.
 */
export const analyzeImageQuestion = async (imageFile, query, marks, token) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile, { filename: 'image.jpg' });
        formData.append('query', query || "");
        formData.append('marks', marks || 5);

        const response = await pythonApi.post('/history-sources/analyze-image-question', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error in analyzeImageQuestion service:', error.response?.data || error.message);
        throw error;
    }
};

export default {
    analyzeImageQuestion
};
