const assert = require('assert');
const axios = require('axios');

// Use environment variable or default to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Smoke Tests', function() {
  it('Should return 200 on health endpoint', async function() {
    const response = await axios.get(`${BASE_URL}/api/health`);
    assert.strictEqual(response.status, 200);
  });
  
  it('Should return 200 on main page', async function() {
    const response = await axios.get(`${BASE_URL}/`);
    assert.strictEqual(response.status, 200);
  });
});
