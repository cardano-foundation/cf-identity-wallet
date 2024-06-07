// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { Crypto } from "@peculiar/webcrypto";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextDecoder, TextEncoder, ReadableStream } = require("node:util");

Reflect.set(globalThis, "TextDecoder", TextDecoder);
Reflect.set(globalThis, "TextEncoder", TextEncoder);
Reflect.set(globalThis, "ReadableStream", { ...ReadableStream, prototype: {} });

Object.defineProperty(global, "crypto", {
  value: new Crypto(),
  writable: true,
});

global.structuredClone = (v) => JSON.parse(JSON.stringify(v));
