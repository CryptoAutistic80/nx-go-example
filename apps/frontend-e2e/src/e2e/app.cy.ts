describe('Chat Application', () => {
  beforeEach(() => {
    // Mock the JWT token endpoint
    cy.intercept('GET', 'http://localhost:8080/auth/token', {
      statusCode: 200,
      body: { token: 'test-token' },
    }).as('getToken');

    // Visit the chat page
    cy.visit('/');
  });

  it('should load the chat interface', () => {
    // Wait for token to be fetched
    cy.wait('@getToken');

    // Check for main UI elements
    cy.get('select.modelSelect').should('exist');
    cy.get('button.newChatButton').should('exist');
    cy.get('input.input').should('exist');
    cy.get('button.button').contains('Send').should('exist');
  });

  it('should show loading state initially', () => {
    // Before token is fetched, should show loading
    cy.contains('Loading...').should('exist');
  });
}); 