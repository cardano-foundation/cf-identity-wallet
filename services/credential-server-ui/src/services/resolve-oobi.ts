import axios from "axios";
import { config } from "../config";

export const resolveOobi = async (oobi: string) => {
  try {
    const response = await axios.post(
      `${config.endpoint}${config.path.resolveOobi}`,
      { oobi },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error in resolveOobi function:", error);

    if (axios.isAxiosError(error) && error.response) {
      console.error(
        "Server responded with:",
        error.response.status,
        error.response.data
      );
    }

    throw error;
  }
};
