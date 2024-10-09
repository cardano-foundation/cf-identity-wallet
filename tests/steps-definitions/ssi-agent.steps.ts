import { Then } from "@wdio/cucumber-framework";
import SsiAgentDetailsScreen from "../screen-objects/ssi-agent-details.screen.js";

Then(/^user can see SSI Agent Details screen$/, async function () {
  await SsiAgentDetailsScreen.loads();
});