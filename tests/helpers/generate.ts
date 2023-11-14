import { faker } from "@faker-js/faker";

export const generateRandomNumbersArray = (): number[] =>
  Array.from({ length: 6 }, () => faker.number.int({ min: 0, max: 9 }));
