export default {
  clearMocks: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "/node_modules",
    "/e2e",
    "src/ui",
    "src/routes",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ["clover", "json", "lcov", "text", "text-summary"],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 52,
      functions: 60,
      lines: 82,
    },
  },
  moduleFileExtensions: [
    "js",
    "ts",
    "json",
    "node",
  ],
  moduleNameMapper: {
    // Jest cannot import the browser version so we can map in the NodeJS version instead.
    "@dcspark/cardano-multiplatform-lib-browser": "@dcspark/cardano-multiplatform-lib-nodejs",
    "lucid-cardano": "@jpg-store/lucid-cardano",
  },
  testEnvironment: "node",
  testMatch: ["**/src/core/**/?(*.)+(test).[tj]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: [],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
    "^.+\\.(js)$": "babel-jest"
  }
};
