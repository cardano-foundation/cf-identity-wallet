import { driver } from "@wdio/globals";
import { expect } from "expect-webdriverio";
import { Message } from "../constants/toast.constants.js";
import { KeyIdentifierType } from "../constants/keyIdentifier.types.js";
import Assert from "./assert.js";
import IdentityCardDetailsScreen from "../screen-objects/identity/identity-card-details.screen.js";

export function cardDetails() {
  const copyAndVerifyDetailsFor = async (blockName: string) => {
    await driver.setClipboard("");
    await (
      await IdentityCardDetailsScreen.cardBlockButtonFor(blockName)
    ).click();
    await Assert.toast(Message.CopiedToClipboard);
    await Assert.clipboard();
  };

  const choseIdentityDetailsToVerify = async (identifierType: string) => {
    switch (identifierType) {
    case KeyIdentifierType.DIDKEY:
      await copyAndVerifyDetailsFor("information");
      await copyAndVerifyDetailsFor("type");
      await copyAndVerifyDetailsFor("publickeybase58");
      return;
    case KeyIdentifierType.KERI:
      await copyAndVerifyDetailsFor("signing-key-0");
      await copyAndVerifyDetailsFor("next-key-0");
      await copyAndVerifyDetailsFor("backer-address");
      return;
    }
  };

  const assertDidKeyBlockFor = async (blockName: string) => {
    const blockText = blockName;
    blockName = blockName.replace(/\s+/g, "");
    await expect(
      await IdentityCardDetailsScreen.cardBlockTitleFor(blockName)
    ).toHaveText(blockText, {
      ignoreCase: true,
    });
    await expect(
      await IdentityCardDetailsScreen.cardBlockTextValueFor(blockName)
    ).toBeDisplayed();
    await expect(
      await IdentityCardDetailsScreen.cardBlockButtonFor(blockName)
    ).toBeDisplayed();
  };

  const cardBlocksForDidKey = async () => {
    await assertDidKeyBlockFor("information");
    await expect(
      await IdentityCardDetailsScreen.cardBlockTextValueFor("information-date")
    ).toBeDisplayed();
    await assertDidKeyBlockFor("type");
    await assertDidKeyBlockFor("public key base 58");
  };

  const assertKeriPartialBlockFor = async (
    blockTitle: string,
    blockTestId: string
  ) => {
    await expect(
      await IdentityCardDetailsScreen.cardBlockTitleFor(
        blockTitle.replace(/\s+/g, "")
      )
    ).toHaveText(blockTitle, {
      ignoreCase: true,
    });
    await expect(
      await IdentityCardDetailsScreen.cardBlockTextValueFor(blockTestId)
    ).toBeDisplayed();
  };

  const assertKeriBlockFor = async (
    blockTitle: string,
    blockTestId: string
  ) => {
    await assertKeriPartialBlockFor(blockTitle, blockTestId);
    await expect(
      await IdentityCardDetailsScreen.cardBlockButtonFor(blockTestId)
    ).toBeDisplayed();
  };

  const cardBlocksForKeri = async () => {
    await assertKeriBlockFor("list of signing keys", "signing-key-0");
    await assertKeriBlockFor("list of next key digests", "next-key-0");
    await assertKeriPartialBlockFor("creation timestamp", "creation-timestamp");
    await assertKeriBlockFor("backer address", "backer-address");
  };

  return {
    choseIdentityDetailsToVerify,
    cardBlocksForDidKey,
    cardBlocksForKeri,
  };
}
