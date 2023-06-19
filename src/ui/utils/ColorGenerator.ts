class ColorGenerator {
  private colorSet;

  constructor(
    private readonly lightness: number = 75,
    private readonly saturation: number = 75,
    initialColors: string[] = []
  ) {
    this.colorSet = new Set(initialColors);
  }

  private randomHSLToHex(): [string, string] {
    const hue = Math.floor(Math.random() * 360);

    let lightness = Math.max(this.lightness, 60);
    if (lightness > 80) {
      lightness = 80;
    }

    const color1 = this.hslToHex(hue, this.saturation, lightness);
    const color2 = this.hslToHex(
      hue,
      this.saturation,
      this.lightness + 10 < 100 ? this.lightness + 10 : 100
    );

    return [color1, color2];
  }

  private hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number, k = (n + h / 30) % 12) =>
      l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  }

  public generateColorPairs(numPairs = 1) {
    const newColorPairs: Array<[string, string]> = [];
    for (let i = 0; i < numPairs; i++) {
      const [color1, color2] = this.randomHSLToHex();
      const colorKey = [color1, color2].sort().join(":");

      if (!this.colorSet.has(colorKey)) {
        this.colorSet.add(colorKey);
        newColorPairs.push([color1, color2]);
      }
    }

    return newColorPairs;
  }

  public generateNextColor() {
    let [color1, color2] = this.randomHSLToHex();
    let colorKey = [color1, color2].sort().join(":");
    let newColor = this.colorSet.has(colorKey);

    while (!newColor) {
      [color1, color2] = this.randomHSLToHex();
      colorKey = [color1, color2].sort().join(":");
      if (!this.colorSet.has(colorKey)) {
        newColor = true;
      }
    }

    this.colorSet.add(colorKey);
    return [color1, color2];
  }

  public getUsedColors() {
    return Array.from(this.colorSet);
  }
}

export { ColorGenerator };
