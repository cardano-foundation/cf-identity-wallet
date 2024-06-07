import { ellipsisText, formatCurrencyUSD } from "./formatters";

describe("Utils", () => {
  test("formatCurrencyUSD", () => {
    const balance = 1012.0;
    expect(formatCurrencyUSD(balance)).toBe("$1,012.00");
  });

  test("ellipsisText", () => {
    expect(ellipsisText("text text text", 3)).toBe("tex...");
  });
});
