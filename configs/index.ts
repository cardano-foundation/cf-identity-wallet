import { EnvironmentType } from "./types";
import developmentEnv from "./development.yaml";
import producntionEnv from "./production.yaml";
const environment = process.env.ENVIRONMENT || "development";

export default (environment === "development"
  ? developmentEnv
  : producntionEnv) as EnvironmentType;
