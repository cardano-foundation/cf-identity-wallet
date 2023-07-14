export default {
  clearMocks: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "/node_modules",
    "src/routes/index.tsx",
    "/e2e",
    "src/ui",
    "src/core/aries",
    "src/core/storage",
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
    "mjs",
    "cjs",
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
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: [],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"]
};
