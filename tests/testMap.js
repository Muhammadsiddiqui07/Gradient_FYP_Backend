import axios from 'axios';
import generateToken from './generateToken.js';

const queries = ['rivers', 'airports', 'crops', 'provinces', 'dams'];

const API_URL = 'http://localhost:4000/api/map';

async function testQuery(query, token) {
    console.log(`\n--- Testing query: "${query}" ---`);
    try {
        const response = await axios.get(API_URL, {
            params: { query },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const { points, paths, regions, explanation } = response.data;

        console.log(`Points Count:  ${points.length}`);
        console.log(`Paths Count:   ${paths.length}`);
        console.log(`Regions Count: ${regions.length}`);
        console.log(`Explanation:   ${explanation}`);

    } catch (error) {
        if (error.response?.status === 401) {
            console.error(`FAILED: Unauthorized - ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`FAILED: ${error.response?.data?.message || error.message}`);
        }
    }
}

async function runTests() {
    console.log('Starting Map API tests...');
    try {
        const token = await generateToken();
        console.log('Generated Token successfully.');
        
        for (const query of queries) {
            await testQuery(query, token);
        }
    } catch (error) {
        console.error('Initial error:', error.message);
    }
    console.log('\nTests completed.');
}

runTests();
