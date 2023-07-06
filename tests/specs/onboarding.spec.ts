
import {pause, restartApp, url} from "../platform";
import Onboarding from "../pageobjects/onboarding.page";
import {getUrl} from "../helpers";
describe("Onboarding page", () => {

  beforeEach(async () => {
    await restartApp('/');
    await url('/');
    await pause(500);
  });

  it("Full onboarding process", async () => {
    const getStartedButton = await Onboarding.getStartedButton;

    await getStartedButton.click();


    await pause(500);
    const url = await getUrl();
    expect(url.toString()).toContain('createpassword');
  });

});
