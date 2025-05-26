// cypress/e2e/home.cy.js
describe('Home Page', () => {
  it('loads successfully', () => {
    cy.visit('/');
    cy.contains('Welcome'); // Adjust based on your homepage
  });
});
