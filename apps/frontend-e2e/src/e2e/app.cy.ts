describe('Chat Application', () => {
  beforeEach(() => {
    // Mock the JWT token endpoint
    cy.intercept('GET', 'http://localhost:8080/auth/token', {
      statusCode: 200,
      body: { token: 'test-token' },
    }).as('getToken');

    // Visit the chat page directly
    cy.visit('/chat');
  });

  it('should show loading state initially', () => {
    // Before token is fetched, should show loading
    cy.contains('Loading...', { timeout: 10000 }).should('exist');
  });

  it('should load the chat interface', () => {
    // Wait for token to be fetched
    cy.wait('@getToken', { timeout: 10000 });

    // Loading should disappear
    cy.contains('Loading...').should('not.exist');

    // Check for main UI elements
    cy.get('[class*=modelSelect]').should('exist');
    cy.get('[class*=newChatButton]').should('exist');
    cy.get('[class*=input]').should('exist');
    cy.get('[class*=button]').contains('Send').should('exist');
  });
}); 