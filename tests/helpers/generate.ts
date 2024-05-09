import { faker } from "@faker-js/faker";
import { createGenerator } from "ts-json-schema-generator";

export const generateRandomNumbersArray = (): number[] =>
  Array.from({ length: 6 }, () => faker.number.int({ min: 0, max: 9 }));

const getRandomChar = (characters: string): string => {
  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters[randomIndex];
};

export function jsonSchema(projectFileName: string, typeName: string) {
  const generator = createGenerator({
    path: `./tests/helpers/models/${projectFileName}`,
    type: typeName,
  });

  return generator.createSchema(typeName);
}

export const randomNameWithPrefix = async (prefix: string) => {
  return `test-${prefix}-${faker.lorem.word({
    length: { min: 3, max: 7 },
  })}-${faker.number.int({ min: 1000, max: 9999 })}`;
};

export const returnPassword = async (length: number) => {
  const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()";

  const allCharacters = uppercaseLetters + lowercaseLetters + numbers + symbols;
  let result = "";

  result += getRandomChar(uppercaseLetters);
  result += getRandomChar(lowercaseLetters);
  result += getRandomChar(numbers);
  result += getRandomChar(symbols);

  for (let i = result.length; i < length; i++) {
    result += getRandomChar(allCharacters);
  }

  return result;
};
