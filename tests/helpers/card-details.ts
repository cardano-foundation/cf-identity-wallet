import { driver } from "@wdio/globals";
import { expect } from "expect-webdriverio";
import { Message } from "../constants/toast.constants.js";
import Assert from "./assert.js";
import IdentityCardDetailsScreen from "../screen-objects/identity/identity-card-details.screen.js";

export function cardDetails() {
  const backerAddressName = "backer-address"
  const nextKeyName = "next-key-0"
  const signingKeyName = "signing-key-0"

  const copyAndVerifyDetailsFor = async (blockName: string) => {
    await driver.setClipboard("");
    await (
      await IdentityCardDetailsScreen.cardBlockButtonFor(blockName)
    ).click();
    await Assert.toast(Message.CopiedToClipboard);
    await Assert.clipboard();
  };

  const keriIdentityDetailsToVerify = async () => {
    await copyAndVerifyDetailsFor(signingKeyName);
    await copyAndVerifyDetailsFor(nextKeyName);
    await copyAndVerifyDetailsFor(backerAddressName);
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
    await assertKeriBlockFor("list of signing keys", signingKeyName);
    await assertKeriBlockFor("list of next key digests", nextKeyName);
    await assertKeriPartialBlockFor("creation timestamp", "creation-timestamp");
    await assertKeriBlockFor("backer address", backerAddressName);
  };

  return {
    choseIdentityDetailsToVerify: keriIdentityDetailsToVerify,
    cardBlocksForKeri,
  };
}
