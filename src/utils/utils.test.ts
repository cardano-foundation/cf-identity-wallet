import { equals, shuffle } from "./utils";

describe("Utils functions", () => {
  const seed1 = [
    "multiply",
    "actual",
    "hello",
    "garden",
    "chase",
    "test",
    "liberty",
    "cube",
    "warrior",
    "humor",
    "doctor",
    "fresh",
    "quit",
    "then",
    "wave",
  ];
  const seed2 = [
    "wall",
    "ghost",
    "lesson",
    "series",
    "soup",
    "sting",
    "fashion",
    "wolf",
    "hedgehog",
    "large",
    "ridge",
    "people",
    "tunnel",
    "muffin",
    "green",
  ];
  test("Verifies if two variables are the same", () => {
    expect(equals(seed1, seed1)).toBeTruthy();

    expect(equals(seed1, seed2)).toBeFalsy();
  });

  test("Shuffles the elements of an array", () => {
    expect(equals(seed1, seed1)).toBeTruthy();

    expect(equals(seed1, shuffle(seed1))).toBeFalsy();
  });
});
