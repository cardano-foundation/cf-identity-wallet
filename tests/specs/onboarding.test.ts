
import {pause, restartApp, url} from "../platform";
describe("Onboarding page", () => {

  beforeEach(async () => {
    await restartApp('/home');
    await url('/home');
    await pause(500);
  });

  it("Should Show Detail Page Id 1", async () => {

  });

});
