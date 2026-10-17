import FormData from 'form-data';
import pythonApi from './pythonApi.js';

const appendImage = (formData, fieldName, file) => {
    formData.append(fieldName, file.buffer, {
        filename: file.originalname || 'image.jpg',
        contentType: file.mimetype || 'image/jpeg',
    });
};

/**
 * Economics paper one — text-only, image-only, or both (single API call).
 */
export const economics_Paper_One = async ({ query, imageFile, token }) => {
    try {
        const formData = new FormData();
        formData.append('query', query || '');

        if (imageFile) {
            appendImage(formData, 'image', imageFile);
        }

        const response = await pythonApi.post(
            '/economics/explain-mcq',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${token}`,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error in economics_Paper_One service:', error.response?.data || error.message);
        throw error;
    }
};

export const economics_Paper_Two = async ({ section, query, imageFiles, token }) => {
    try {
        const formData = new FormData();
        formData.append('section', section);

        if (query) {
            formData.append('query', query);
        }

        for (const file of imageFiles) {
            appendImage(formData, 'images', file);
        }

        const response = await pythonApi.post(
            '/economics/paper2/answer',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${token}`,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error in economics_Paper_Two service:', error.response?.data || error.message);
        throw error;
    }
};

export default {
    economics_Paper_One,
    economics_Paper_Two,
};
