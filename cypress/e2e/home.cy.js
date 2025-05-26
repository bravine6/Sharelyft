// cypress/e2e/home.cy.js
describe('Home Page', () => {
  it('loads successfully', () => {
    cy.visit('/');
    
    // Test for multiple elements that should be on the page
    // This makes the test more resilient
    cy.contains('Sharelyft', {timeout: 10000}); // Check for site title
    cy.contains('Find a ride', {timeout: 10000}); // Check for menu item
    
    // Original check with corrected casing
    cy.contains('Offer a ride', {timeout: 10000});
  });
});