
import {pause, restartApp, url} from "../platform";
import Onboarding from "../pageobjects/onboarding.page";
import SetPasscodePage from "../pageobjects/setpasscode.page";
import GenerateSeedPhrasePage from "../pageobjects/generateseedphrase.page";
import VerifySeedPhrasePage from "../pageobjects/verifyeedphrase.page";
import {getUrl} from "../helpers";
describe("Onboarding page", () => {

  beforeEach(async () => {
    try {
      await browser.execute('window.localStorage.clear();');
    } catch (e) {
      console.log(e)
    }
    await restartApp("/");
    // await url("/");
    await pause(500);
  });

  it("Full onboarding process", async () => {


    const getStartedButton = await Onboarding.getStartedButton;

    await getStartedButton.click();


    await pause(500);
    let url = await getUrl();
    expect(url.toString()).toContain("setpasscode");

    for (let i = 0; i < 12; i++) {
      await SetPasscodePage.getNumberButton(1).click();
    }
    url = await getUrl();
    expect(url.toString()).toContain("generateseedphrase");
    await GenerateSeedPhrasePage.getTermsAndConditionsCheckBox().click();
    await GenerateSeedPhrasePage.getRevealSeedPhraseButton().click();

    const generatedWords = [];
    for (let i = 0; i < 15; i++){
      const word = await GenerateSeedPhrasePage.getSeedWord(i);
      generatedWords.push(word);
    }

    await GenerateSeedPhrasePage.getContinueButton().click();
    await pause(500);
    await (await GenerateSeedPhrasePage.getConfirmButton()).click();

    url = await getUrl();
    expect(url.toString()).toContain("verifyseedphrase");
    for (let i = 0; i < generatedWords.length; i++){
      const wordChip = VerifySeedPhrasePage.getWordButton(generatedWords[i]);
      await wordChip.click();
    }

    await pause(500);
    await VerifySeedPhrasePage.getConfirmButton().click();

    url = await getUrl();
    expect(url.toString()).toContain("tabs/dids");

  });

});
