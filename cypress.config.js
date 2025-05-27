const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    browser: 'chrome',
    chromeWebSecurity: false,
    specPattern: 'cypress/e2e/**/*.cy.js',
    baseUrl: "http://localhost:3000",
    supportFile: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    viewportWidth: 1280,
    viewportHeight: 720
  },
});