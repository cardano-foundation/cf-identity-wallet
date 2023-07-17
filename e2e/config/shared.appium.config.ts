import { config } from "./shared.config";

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
