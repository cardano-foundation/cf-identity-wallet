import { Addresses } from "./addresses";

const VALID_SEEDPHRASE = [
  "test",
  "walk",
  "nut",
  "penalty",
  "hip",
  "pave",
  "soap",
  "entry",
  "language",
  "right",
  "filter",
  "choice",
].join(" ");
const VALID_ROOT_EXTENDED_PRIVATE_KEY =
  "608621fb4c0101feb31f6f2fd7018bee54101ff67d555079671893225ee1a45e2331497029d885b5634405f350508cd95dce3991503b10f128d04f34b7b625783a1e3bd5dcf11fd4f989ec2cdcdea3a54db8997398174ecdcc87006c274176a0";
const INVALID_SEEDPHRASE = "INVALID_SEEDPHRASE";

describe("Generate a root extended private key from seedphrase", () => {
  test("Will return a root extended private key from a seedphrase", async () => {
    expect(
      await Addresses.convertToRootXPrivateKeyHex(VALID_SEEDPHRASE)
    ).toEqual(VALID_ROOT_EXTENDED_PRIVATE_KEY);
    expect(
      await Addresses.convertToRootXPrivateKeyHex(INVALID_SEEDPHRASE)
    ).toThrowError(new Error("Invalid mnemonic"));
  });
});
