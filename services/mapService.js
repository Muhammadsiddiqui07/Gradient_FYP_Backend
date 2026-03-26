import axios from 'axios';
import FormData from 'form-data';

/**
 * Analyzes a map query using a separate Python FastAPI service.
 * 
 * @param {string} query - The map query (e.g., "rivers", "airports").
 * @param {string} token - JWT token for authorization.
 * @param {string|null} imagePath - Path to an optional image (not used in this step).
 * @returns {Promise<Object>} Processed map data.
 */
export const analyzeMap = async (query, token, imagePath = null) => {
    try {
        const formData = new FormData();
        formData.append('query', query);
        
        // If imagePath was provided, we would append it here
        // if (imagePath) {
        //     formData.append('image', fs.createReadStream(imagePath));
        // }

        const response = await axios.post('http://localhost:8000/analyze-map', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        const data = response.data;

        // Process result as requested
        return {
            points: data.features ? data.features.filter(f => f.type === 'point') : [],
            paths: data.features ? data.features.filter(f => f.type === 'path') : [],
            regions: data.features ? data.features.filter(f => f.type === 'region') : [],
            explanation: data.explanation || "",
            query: data.query || query
        };
    } catch (error) {
        console.error('Error in analyzeMap service:', error.response?.data || error.message);
        throw error;
    }
};

export default {
    analyzeMap
};
