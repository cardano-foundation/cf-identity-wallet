import { config } from "../config";
import { httpInstance } from "./http";

const ContactService = {
  delete: async (contactId: string) => {
    return httpInstance.delete(`${config.path.deleteContact}?id=${contactId}`);
  },
};

export { ContactService };
