import { Addresses } from "./addresses";

const SEEDPHRASE = [ "test", "walk", "nut", "penalty", "hip", "pave", "soap", "entry", "language", "right", "filter", "choice" ].join('');
const ROOT_EXTENDED_PRIVATE_KEY = "keythatdoesnotexist";

describe("Generate a root extended private key from seedphrase", () => {
  test("Will return a root extended private key from a seedphrase", async () => {
    expect(await Addresses.convertToRootXPrivateKeyHex(SEEDPHRASE)).toEqual(ROOT_EXTENDED_PRIVATE_KEY);
  });
});
