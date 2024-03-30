import { combineClassNames } from "./style";

describe("Combine class", () => {
  it("Combine class", () => {
    const result = combineClassNames("class1", undefined, {
      class2: true,
      class3: false,
      class4: true,
    });

    expect(result).toBe("class1 class2 class4");
  });

  it("Return undefined", () => {
    const result = combineClassNames(undefined, {
      class2: false,
      class3: false,
      class4: false,
    });

    expect(result).toBe(undefined);
  });
});
