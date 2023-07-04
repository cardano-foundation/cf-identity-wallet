
import EN_TRANSLATIONS from "../../src/locales/en/en.json";

describe("Onboarding process", () => {
  let generatedWords: string[];

  beforeEach(() => {
    cy.visit("http://localhost:3003");
    generatedWords = [];
  });

  it("Full onboarding process", async () => {
    cy.get("[data-testid=\"get-started-button\"]").click();

    cy.contains("1").click();
    cy.contains("2").click();
    cy.contains("3").click();
    cy.contains("4").click();
    cy.contains("5").click();
    cy.contains("6").click();

    cy.contains("1").click();
    cy.contains("2").click();
    cy.contains("3").click();
    cy.contains("4").click();
    cy.contains("5").click();
    cy.contains("6").click();

    cy.get("[data-testid=\"termsandconditions-checkbox\"]").click();

    cy.contains(EN_TRANSLATIONS.generateseedphrase.privacy.overlay.button).click();

    for (let i = 0; i < 15; i++){
      cy.get(`[data-testid="word-index-${i}"]`)
        .invoke("text").then(text => generatedWords.push(text));
    }

    const wordPromises: any[] = [];
    for (let i = 0; i < 15; i++) {
      wordPromises.push(
        cy.get(`[data-testid="word-index-${i}"]`)
          .invoke("text")
          .then((text) => text)
      );
    }

    cy.contains(EN_TRANSLATIONS.generateseedphrase.continue.button).click();
    cy.contains(EN_TRANSLATIONS.generateseedphrase.alert.button.confirm).click();

    Cypress.Promise.all(wordPromises)
      .then((words:string[]) => {
        generatedWords = words;
      })
      .then(() => {
        for (let i = 0; i < generatedWords.length; i++) {
          cy.get(`[data-testid="remaining-word-${generatedWords[i]}"]`).click()
        }
      });

    cy.get("[data-testid=\"continue-button-verify-seedphrase\"]").click();

    /*
    * Reference for input typing
    * cy.get("[data-testid=\"edit-display-name\"]").clear();
    * cy.get("[data-testid=\"edit-display-name\"]").type("Im cypress");
    */
  });
});
