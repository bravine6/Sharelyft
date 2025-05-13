const assert = require('assert');
const axios = require('axios');
const fs = require('fs');

describe('Security Tests', function() {
  it('Should have secure headers', async function() {
    const response = await axios.get('http://test-sharelyft:3000/');
    assert.strictEqual(response.headers['x-xss-protection'], '1; mode=block');
    assert.strictEqual(response.headers['x-content-type-options'], 'nosniff');
  });
  
  it('Should validate input properly', async function() {
    try {
      await axios.post('http://test-sharelyft:3000/api/users', {
        email: "test' OR '1'='1",
        password: "123"
      });
      assert.fail('Should have rejected SQL injection attempt');
    } catch (error) {
      assert.strictEqual(error.response.status, 400);
    }
  });
});