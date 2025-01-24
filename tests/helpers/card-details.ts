import { driver } from "@wdio/globals";
import { Message } from "../constants/toast.constants.js";
import Assert from "./assert.js";
import IdentifierCardDetailsScreen from "../screen-objects/identifiers/identifier-card-details.screen.js";

export function cardDetails() {

  const copyAndVerifyDetailsFor = async (blockName: string) => {
    await driver.setClipboard("");
    await (
      await IdentifierCardDetailsScreen.copyButtonFor(blockName)
    ).click();
    await Assert.toast(Message.CopiedToClipboard);
    await Assert.clipboard();
  };

  const choseIdentifierDetailsToVerify = async () => {
    await copyAndVerifyDetailsFor(IdentifierCardDetailsScreen.identifierIdLocator);
    await copyAndVerifyDetailsFor(IdentifierCardDetailsScreen.signingKeyLocator);
  };

  return {
    choseIdentifierDetailsToVerify,
  };
}
