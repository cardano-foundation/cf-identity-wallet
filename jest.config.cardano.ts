export default {
  clearMocks: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "/node_modules",
    "/e2e",
    "src/core/aries",
    "src/core/storage",
    "src/ui",
    "src/routes",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ["clover", "json", "lcov", "text", "text-summary"],
  coverageThreshold: {
    // TODO @jimcase adjust coverage, wallet.ts implementation and unit tests missing
    global: {
      statements: 60,
      branches: 52,
      functions: 20,
      lines: 60,
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
  testMatch: ["**/src/core/cardano/**/?(*.)+(test).[tj]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "src/core/aries", "src/core/storage"],
  transformIgnorePatterns: [],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
    "^.+\\.(js)$": "babel-jest"
  }
};
