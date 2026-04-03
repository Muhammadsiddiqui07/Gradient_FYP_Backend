import axios from 'axios';
import FormData from 'form-data';

const PYTHON_API_URL = 'http://localhost:8000';

/**
 * Sends a query to the AI examiner in the Python backend.
 */
export const askAi = async (query, marks, token) => {
    try {
        const formData = new FormData();
        formData.append('query', query);
        formData.append('marks', marks);

        const response = await axios.post(`${PYTHON_API_URL}/ask-ai`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error in askAi service:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Gets a weakness analysis for the current user.
 */
export const analyzeWeakness = async (token) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/analyze-weakness`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error in analyzeWeakness service:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Gets papers navigation data (years, sessions, content).
 */
export const getPapersData = async (endpoint, token) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error in getPapersData service for ${endpoint}:`, error.response?.data || error.message);
        throw error;
    }
};

export default {
    askAi,
    analyzeWeakness,
    getPapersData
};
