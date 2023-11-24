import { Addresses } from "./addresses";

const validSeedPhrase15Words =
  "test walk nut penalty hip pave soap entry language right filter choice";
const entropy15Words = "df9ed25ed146bf43336a5d7cf7395994";
const rootXprvKey15Words =
  "xprv1vzrzr76vqyqlavclduhawqvtae2pq8lk0424q7t8rzfjyhhp530zxv2fwq5a3pd4vdzqtu6s2zxdjhww8xg4qwcs7y5dqne5k7mz27p6rcaath83rl20nz0v9nwdaga9fkufjuucza8vmny8qpkzwstk5quneyk9";
const mainnetAddr0 =
  "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwqfjkjv7";
const testnetAddr0 =
  "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp";
const mainnetRewardAddr0 =
  "stake1uyevw2xnsc0pvn9t9r9c7qryfqfeerchgrlm3ea2nefr9hqxdekzz";
const testnetRewardAddr0 =
  "stake_test1uqevw2xnsc0pvn9t9r9c7qryfqfeerchgrlm3ea2nefr9hqp8n5xl";
const validSeedPhrase24Words =
  "find bag dilemma sing symptom page sand exotic celery tape cat typical sea portion jar return trophy warfare tribe soap protect tuna goddess shine";
const entropy24Words =
  "56a230f8e4adc93defca80251bb88f75fc1f509dd5c1e8fee3a166dacbd4d90e";
const rootXprvKey24Words =
  "xprv18pntsvwvvxj796fulp593yfepesetg3ahfugd404dxy5r6m9r4x39xsswdjqjm9wzgp5n0mtr7twp9949473a8nywrkv2l6fxc9cvvncvukmjvf7e467a9um26pa5su2tuh9pva770g5qs4jd95zvw3upuhhyvxv";
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
    expect(Addresses.entropyToBip32NoPasscode(entropy15Words)).toEqual(
      rootXprvKey15Words
    );
    expect(Addresses.entropyToBip32NoPasscode(entropy24Words)).toEqual(
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
});
