import { config } from "./shared.config";

//
// =====================
// Server Configurations
// =====================
//
// The server port Appium is running on
//
config.port = 4723;

//
// ================
// Services: Appium
// ================
//

config.services = [
  ...(config.services as Array<string | { command: string; args: { log?: string | undefined; relaxedSecurity: boolean; }; }>),
  [
    "appium",
    {
      command: "appium",
      args: {
        relaxedSecurity: true,
        ...(process.env.VERBOSE === "true" ? { log: "./appium.log" } : {}),
      },
    },
  ],
] as Array<string | { command: string; args: { log?: string | undefined; relaxedSecurity: boolean; }; }>;




export default config;
