const assert = require('assert');
const axios = require('axios');

describe('Smoke Tests', function() {
  it('Should return 200 on health endpoint', async function() {
    const response = await axios.get('http://test-sharelyft:3000/api/health');
    assert.strictEqual(response.status, 200);
  });
  
  it('Should return 200 on main page', async function() {
    const response = await axios.get('http://test-sharelyft:3000/');
    assert.strictEqual(response.status, 200);
  });
});