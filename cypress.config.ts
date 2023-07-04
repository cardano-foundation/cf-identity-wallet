import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3003",
    viewportWidth: 390, //iphone 12 pro
    viewportHeight: 844 //iphone 12 pro
  },
});
