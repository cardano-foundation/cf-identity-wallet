import {pause, restartApp} from "../platform";
import {OnboardingPage} from "../pageobjects/onboarding.page";
import {SetPasscodePage} from "../pageobjects/setpasscode.page";
import {GenerateSeedPhrasePage} from "../pageobjects/generateseedphrase.page";
import {VerifySeedPhrasePage} from "../pageobjects/verifyeedphrase.page";
import {getUrl} from "../helpers";
describe("Onboarding page", () => {

  beforeEach(async () => {
    try {
      // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-undef
      await browser.execute('window.localStorage.clear();');
    } catch (e) {
      //
    }
    await restartApp("/");
    // await url("/");
    await pause(500);
  });

  it("Full onboarding process", async () => {


    const onBoardingPage = new OnboardingPage();
    const getStartedButton = onBoardingPage.getStartedButton;

    await getStartedButton.click();


    await pause(500);
    let url = await getUrl();
    expect(url.toString()).toContain("setpasscode");

    const setPasscodePage = new SetPasscodePage();
    for (let i = 0; i < 12; i++) {
      await setPasscodePage.getNumberButton(1).click();
    }
    url = await getUrl();
    expect(url.toString()).toContain("generateseedphrase");

    const generateSeedPhrasePage = new GenerateSeedPhrasePage();
    await generateSeedPhrasePage.getTermsAndConditionsCheckBox().click();
    await generateSeedPhrasePage.getRevealSeedPhraseButton().click();

    const generatedWords = [];
    for (let i = 0; i < 15; i++){
      const word = await generateSeedPhrasePage.getSeedWord(i);
      generatedWords.push(word);
    }

    await generateSeedPhrasePage.getContinueButton().click();
    await pause(500);
    await (await generateSeedPhrasePage.getConfirmButton()).click();

    url = await getUrl();

    const verifySeedPhrasePage = new VerifySeedPhrasePage();
    expect(url.toString()).toContain("verifyseedphrase");
    for (let i = 0; i < generatedWords.length; i++){
      const wordChip = verifySeedPhrasePage.getWordButton(generatedWords[i]);
      await wordChip.click();
    }

    await pause(500);
    await verifySeedPhrasePage.getConfirmButton().click();

    url = await getUrl();
    expect(url.toString()).toContain("tabs/dids");

  });

});
