import { ellipsisBetweenText } from "./text";

describe("Ellipsis between text", () => {
  it("Combine class", () => {
    const result = ellipsisBetweenText(
      "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb"
    );

    expect(result).toBe("ED4Ke...u5Inb");
  });

  it("Return raw text when text length less than 10", () => {
    const result = ellipsisBetweenText("ED4KeyyT");

    expect(result).toBe("ED4KeyyT");
  });
});
