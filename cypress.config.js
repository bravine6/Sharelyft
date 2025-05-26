const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/integration/**/*.js',
    baseUrl: "http://localhost:3000",
    supportFile: false,
  },
});
