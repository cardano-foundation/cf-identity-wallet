import { generateUUID, formatCurrencyUSD } from ".";

describe("Utils", () => {
  test("generateUUID", () => {
    const uuid = generateUUID();
    expect(uuid).toHaveLength(36);
  });

  test("formatCurrencyUSD", () => {
    const balance = 1012.0;
    expect(formatCurrencyUSD(balance)).toBe("$1,012.00");
  });
});
