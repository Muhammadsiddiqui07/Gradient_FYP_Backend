import 'dotenv/config';
import axios from 'axios';

const configuredUrl = process.env.PYTHON_API_URL?.trim();

if (!configuredUrl && process.env.NODE_ENV === 'production') {
    throw new Error('PYTHON_API_URL must be set in production');
}

const timeoutValue = Number(process.env.PYTHON_API_TIMEOUT_MS);
const timeout = Number.isFinite(timeoutValue) && timeoutValue > 0
    ? timeoutValue
    : 120_000;

const pythonApi = axios.create({
    baseURL: (configuredUrl || 'http://localhost:8000').replace(/\/+$/, ''),
    timeout,
});

pythonApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error)) {
            const timedOut = ['ECONNABORTED', 'ETIMEDOUT'].includes(error.code);
            error.statusCode = error.response?.status || (timedOut ? 504 : 502);
        }

        return Promise.reject(error);
    }
);

export default pythonApi;