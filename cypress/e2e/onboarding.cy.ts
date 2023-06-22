
import EN_TRANSLATIONS from "../../src/locales/en/en.json";

describe("Onboarding process", () => {
  let generatedWords: string[];

  beforeEach(() => {
    cy.visit("http://localhost:3003");
    generatedWords = [];
  });

  it("It should click on the start button", () => {
    cy.get("[data-testid=\"get-started-button\"]").click();
  });

  it("Debería ingresar el código de acceso correcto y redirigir", async () => {
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

    // Open terms and conditions
    //cy.contains(EN_TRANSLATIONS.generateseedphrase.termsandconditions.link).click();

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

    const waitForPromises = () => {
      Cypress.Promise.all(wordPromises)
        .then((words:string[]) => {
          generatedWords = words;
          cy.log("words: ", words);
        })
        .then(() => {
          if (generatedWords.length === 15) {
            for (let i = 0; i < generatedWords.length; i++) {
              cy.get(`[data-testid="remaining-word-${generatedWords[i]}"]`).click()
            }
          } else {
            waitForPromises();
          }
        });
    };

    cy.contains(EN_TRANSLATIONS.generateseedphrase.continue.button).click();
    cy.contains(EN_TRANSLATIONS.generateseedphrase.alert.button.confirm).click();

    waitForPromises();

    cy.get("[data-testid=\"continue-button-verify-seedphrase\"]").click();
  });

});
