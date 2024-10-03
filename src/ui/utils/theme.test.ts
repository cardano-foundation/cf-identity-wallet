import { getTheme } from "./theme";

describe("theme", () => {
  it("get theme", () => {
    expect(getTheme(12)).toStrictEqual({
      color: 1,
      layout: 2,
    });
  });
});
