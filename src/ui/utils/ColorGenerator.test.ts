import { ColorGenerator } from "./ColorGenerator";

describe("ColorGenerator", () => {
  let colorGenerator: ColorGenerator;

  beforeEach(() => {
    colorGenerator = new ColorGenerator(75, 75, ["#123456", "#789abc"]);
  });

  test("generateColorPairs should generate the specified number of color pairs", () => {
    const numPairs = 3;
    const colorPairs = colorGenerator.generateColorPairs(numPairs);

    expect(colorPairs).toHaveLength(numPairs);
  });

  test("generateNextColor should generate a new color pair", () => {
    const usedColors = colorGenerator.getUsedColors();
    const [color1, color2] = colorGenerator.generateNextColor();
    const newColors = colorGenerator.getUsedColors();

    expect(newColors).toHaveLength(usedColors.length + 1);
    expect(newColors).toContain(`${color1}:${color2}`);
  });

  test("getUsedColors should return the set of used colors", () => {
    const usedColors = colorGenerator.getUsedColors();

    expect(usedColors).toHaveLength(2);
    expect(usedColors).toEqual(["#123456", "#789abc"]);
  });
});
