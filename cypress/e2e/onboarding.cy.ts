
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import EN_TRANSLATIONS from "../../src/locales/en/en.json";

describe("Onboarding process", () => {
  let generatedWords: string[];

  beforeEach(() => {
    cy.visit("http://localhost:3003");
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
    //cy.contains(EN_TRANSLATIONS.generateseedphrase.termsandconditions.link).click();

    cy.get("[data-testid=\"termsandconditions-checkbox\"]").click();

    cy.contains(EN_TRANSLATIONS.generateseedphrase.privacy.overlay.button).click();

    generatedWords = Array(15).map((_, index:number) => {
      return cy.get(`[data-testid="word-index-${index}"]`)
        .invoke("text");
    });

    cy.contains(EN_TRANSLATIONS.generateseedphrase.continue.button).click();
    cy.contains(EN_TRANSLATIONS.generateseedphrase.alert.button.confirm).click();


    cy.log("generatedWords 2");
    cy.log(generatedWords);

    generatedWords.map(word => {
      cy.log("word");
      cy.log(word);
    })
    /*
    arr.map(w => {
      cy.log("wwwwww");
      cy.log(w);
    })*/
    //cy.wait(1000);
    /*
    generatedWords.forEach((word) => {
      //cy.contains(word).click();
      cy.log("click in word - Verification");
      cy.log(`[data-testid="remaining-word-${word}"]`);
      //cy.contains(`[data-testid="remaining-word-${word}"]`)?.click();
      //cy.get(`[data-testid=\"remaining-word-${word}\"]`).click();
    });*/

  });

});
