import { Salter } from "signify-ts";

function randomSalt(): string {
  return new Salter({}).qb64;
}

export { randomSalt };
