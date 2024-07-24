describe('test-login', () => {
    beforeEach(() => {
      cy.visit('http://localhost:8080/');
    });
  
  
    it('Test : Bouton deviens bleu après le clique', () => {
  
      //Vérifier que le bouton de connexion est  désactivé
      cy.get('#login-btn').should('have.disabled');
  
      //Simule la saisie d'une email valide
      cy.get('#email-field').type('john.doe@example.com');
  
      //Simuler la saisie clavier d'un mot de passe valide
      cy.get('#password-field').type('johndoe69200');
  
      //Vérifier que le bouton de connexion n'est plus désactivé
      cy.get('#login-btn').should('not.have.disabled');
  
      //Simuler le clic sur le bouton de connexion
      cy.get('#login-btn').click();
  
      //Vérifier que la fenêtre modale souhaitant la bienvenue s'affiche / Que la fenetre n'est pas caché
      cy.get('#login-modal').should('have.class', 'modal hide');
      cy.get('#confirm-modal').should('have.class', 'modal hide');
    });
  
  });