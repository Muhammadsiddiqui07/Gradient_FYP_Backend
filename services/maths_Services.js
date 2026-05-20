import axios from 'axios';

const PYTHON_API_URL = 'http://localhost:8000';

/**
 * Sends a query to the AI examiner in the Python backend.
 */
export const maths_Numerical = async (query, marks, token) => {
    try {
        const payload = {
            question: query,
            marks: marks
        };

        const response = await axios.post(`${PYTHON_API_URL}/api/math/solve`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error in maths_Numerical service:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetches all math concept keys from the Python backend.
 */
export const getConcepts = async (token) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/api/math/concepts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching concepts:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetches a specific math concept by its key from the Python backend.
 */
export const getConceptByKey = async (key, token) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/api/math/concepts/${key}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching concept ${key}:`, error.response?.data || error.message);
        throw error;
    }
};

export default {
    maths_Numerical,
    getConcepts,
    getConceptByKey
};
