import { driver } from "@wdio/globals";
import { expect } from "expect-webdriverio";
import { Message } from "../constants/toast.constants.js";
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

  const keriIdentityDetailsToVerify = async () => {
    await copyAndVerifyDetailsFor("signing-key-0");
    await copyAndVerifyDetailsFor("next-key-0");
    await copyAndVerifyDetailsFor("backer-address");
  };

  const assertKeriPartialBlockFor = async (
    blockTitle: string,
    blockTestId: string,
  ) => {
    await expect(
      await IdentityCardDetailsScreen.cardBlockTitleFor(
        blockTitle.replace(/\s+/g, ""),
      ),
    ).toHaveText(blockTitle, {
      ignoreCase: true,
    });
    await expect(
      await IdentityCardDetailsScreen.cardBlockTextValueFor(blockTestId),
    ).toBeDisplayed();
  };

  const assertKeriBlockFor = async (
    blockTitle: string,
    blockTestId: string,
  ) => {
    await assertKeriPartialBlockFor(blockTitle, blockTestId);
    await expect(
      await IdentityCardDetailsScreen.cardBlockButtonFor(blockTestId),
    ).toBeDisplayed();
  };

  const cardBlocksForKeri = async () => {
    await assertKeriBlockFor("list of signing keys", "signing-key-0");
    await assertKeriBlockFor("list of next key digests", "next-key-0");
    await assertKeriPartialBlockFor("creation timestamp", "creation-timestamp");
    await assertKeriBlockFor("backer address", "backer-address");
  };

  return {
    choseIdentityDetailsToVerify: keriIdentityDetailsToVerify,
    cardBlocksForKeri,
  };
}
