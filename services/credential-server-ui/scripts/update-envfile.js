import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Replicate __dirname using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the envfile.js file in the public directory
const envFilePath = join(__dirname, "../public/envfile.js");

// Get the server URL from the environment variable or use a default value
const serverUrl = process.env.SERVER_URL || "http://localhost:3001";

// Content to write to envfile.js
const content = `window.__RUNTIME_CONFIG__ = {
  SERVER_URL: "${serverUrl}"
};`;

// Write the content to envfile.js
writeFileSync(envFilePath, content, "utf8");
console.log(`Updated envfile.js with SERVER_URL: ${serverUrl}`);
