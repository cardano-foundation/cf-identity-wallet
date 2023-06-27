import { Addresses } from "./addresses";

const VALID_SEEDPHRASE_15_WORDS =
  "test walk nut penalty hip pave soap entry language right filter choice";
const ENTROPY_15_WORDS = "df9ed25ed146bf43336a5d7cf7395994";
const ROOT_XPRV_KEY_15_WORDS =
  "608621fb4c0101feb31f6f2fd7018bee54101ff67d555079671893225ee1a45e2331497029d885b5634405f350508cd95dce3991503b10f128d04f34b7b625783a1e3bd5dcf11fd4f989ec2cdcdea3a54db8997398174ecdcc87006c274176a0";
const VALID_SEEDPHRASE_24_WORDS =
  "find bag dilemma sing symptom page sand exotic celery tape cat typical sea portion jar return trophy warfare tribe soap protect tuna goddess shine";
const ENTROPY_24_WORDS =
  "56a230f8e4adc93defca80251bb88f75fc1f509dd5c1e8fee3a166dacbd4d90e";
const ROOT_XPRV_KEY_24_WORDS =
  "3866b831cc61a5e2e93cf8685891390e6195a23dba7886d5f5698941eb651d4d129a107364096cae120349bf6b1f96e094b52d7d1e9e6470ecc57f49360b863278672db9313ecd75ee979b5683da438a5f2e50b3bef3d14042b26968263a3c0f";
const INVALID_SEEDPHRASE = "INVALID_SEEDPHRASE";

describe("Cardano seed phrase and address derivation", () => {
  test("should return the entropy from a seedphrase", async () => {
    expect(Addresses.convertToEntropy(VALID_SEEDPHRASE_15_WORDS)).toEqual(
      ENTROPY_15_WORDS
    );
    expect(Addresses.convertToEntropy(VALID_SEEDPHRASE_24_WORDS)).toEqual(
      ENTROPY_24_WORDS
    );
  });

  test("should throw if an invalid mnemonic is provided", () => {
    expect(() => Addresses.convertToEntropy(INVALID_SEEDPHRASE)).toThrowError();
  });

  test("can return a root extended private key hex from an entropy", async () => {
    expect(Addresses.convertToRootXPrivateKeyHex(ENTROPY_15_WORDS)).toEqual(
      ROOT_XPRV_KEY_15_WORDS
    );
    expect(Addresses.convertToRootXPrivateKeyHex(ENTROPY_24_WORDS)).toEqual(
      ROOT_XPRV_KEY_24_WORDS
    );
  });

  test("should return a seedphrase from an entropy", () => {
    expect(Addresses.convertToMnemonic(ENTROPY_15_WORDS)).toEqual(
      VALID_SEEDPHRASE_15_WORDS
    );
    expect(Addresses.convertToMnemonic(ENTROPY_24_WORDS)).toEqual(
      VALID_SEEDPHRASE_24_WORDS
    );
  });
});
