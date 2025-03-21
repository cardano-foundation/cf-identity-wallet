import axios from "axios";
import { config } from "../config";

const httpInstance = axios.create({
  baseURL: config.endpoint,
});

export { httpInstance };
