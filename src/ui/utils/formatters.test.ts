import { formatCurrencyUSD } from "./formatters";

describe("Utils", () => {
  test("formatCurrencyUSD", () => {
    const balance = 1012.0;
    expect(formatCurrencyUSD(balance)).toBe("$1,012.00");
  });
});
