export default {
  clearMocks: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "/node_modules",
    "src/routes/index.tsx",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ["clover", "json", "lcov", "text", "text-summary"],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 52,
      functions: 71,
      lines: 82,
    },
  },
  moduleFileExtensions: [
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node",
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/ui/__mocks__/fileMock.ts",
    "\\.(css|scss)$": "<rootDir>/src/ui/__mocks__/styleMock.ts",
  },
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: [
    "node_modules/(?!(@ionic/react|@ionic/react-router|@ionic/core|@stencil/core|ionicons|swiper|ssr-window)/)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
