import { Addresses } from "./addresses";
import { NetworkType } from "./addresses.types";

const validSeedPhrase15Words =
  "test walk nut penalty hip pave soap entry language right filter choice";
const entropy15Words = "df9ed25ed146bf43336a5d7cf7395994";
const rootXprvKey15Words =
  "608621fb4c0101feb31f6f2fd7018bee54101ff67d555079671893225ee1a45e2331497029d885b5634405f350508cd95dce3991503b10f128d04f34b7b625783a1e3bd5dcf11fd4f989ec2cdcdea3a54db8997398174ecdcc87006c274176a0";
const rootXpubKey15Words = "e7effdd1c042aae1b5860dd9259207fe0078dc8239959441012e4049128602193a1e3bd5dcf11fd4f989ec2cdcdea3a54db8997398174ecdcc87006c274176a0";
const mainnetAddr0 = "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwqfjkjv7";
const testnetAddr0 = "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp";
const mainnetRewardAddr0 = "stake1uyevw2xnsc0pvn9t9r9c7qryfqfeerchgrlm3ea2nefr9hqxdekzz";
const testnetRewardAddr0 = "stake_test1uqevw2xnsc0pvn9t9r9c7qryfqfeerchgrlm3ea2nefr9hqp8n5xl";
const validSeedPhrase24Words =
  "find bag dilemma sing symptom page sand exotic celery tape cat typical sea portion jar return trophy warfare tribe soap protect tuna goddess shine";
const entropy24Words =
  "56a230f8e4adc93defca80251bb88f75fc1f509dd5c1e8fee3a166dacbd4d90e";
const rootXprvKey24Words =
  "3866b831cc61a5e2e93cf8685891390e6195a23dba7886d5f5698941eb651d4d129a107364096cae120349bf6b1f96e094b52d7d1e9e6470ecc57f49360b863278672db9313ecd75ee979b5683da438a5f2e50b3bef3d14042b26968263a3c0f";
const invalidSeedPhrase = "INVALID_SEEDPHRASE";

describe("Cardano seed phrase and address derivation", () => {
  test("should return the entropy from a seedphrase", async () => {
    expect(Addresses.convertToEntropy(validSeedPhrase15Words)).toEqual(
      entropy15Words
    );
    expect(Addresses.convertToEntropy(validSeedPhrase24Words)).toEqual(
      entropy24Words
    );
  });

  test("should throw if an invalid mnemonic is provided", () => {
    expect(() => Addresses.convertToEntropy(invalidSeedPhrase)).toThrowError();
  });

  test("can return a root extended private key hex from an entropy", async () => {
    expect(Addresses.convertToRootXPrivateKeyHex(entropy15Words)).toEqual(
      rootXprvKey15Words
    );
    expect(Addresses.convertToRootXPrivateKeyHex(entropy24Words)).toEqual(
      rootXprvKey24Words
    );
  });

  test("should return a seedphrase from an entropy", () => {
    expect(Addresses.convertToMnemonic(entropy15Words)).toEqual(
      validSeedPhrase15Words
    );
    expect(Addresses.convertToMnemonic(entropy24Words)).toEqual(
      validSeedPhrase24Words
    );
  });

  test("should return the correct extended public key for private key", () => {
    expect(Addresses.bip32PrivateHexToPublicHex(rootXprvKey15Words)).toEqual(rootXpubKey15Words);
  });

  test("can derive the correct base and reward addresses from root xprv key", () => {
    expect(Addresses.deriveFirstBaseAndRewardAddrs(rootXprvKey15Words)).toEqual({
      addresses: new Map([[NetworkType.MAINNET, [mainnetAddr0]], [NetworkType.TESTNET, [testnetAddr0]]]),
      rewardAddresses: new Map([[NetworkType.MAINNET, [mainnetRewardAddr0]], [NetworkType.TESTNET, [testnetRewardAddr0]]]),
    });
  });
});
