// cypress/e2e/home.cy.js
describe('Home Page', () => {
  it('loads successfully', () => {
    cy.visit('/');
    cy.contains('Offer a Ride'); // Adjust based on your homepage
  });
});
