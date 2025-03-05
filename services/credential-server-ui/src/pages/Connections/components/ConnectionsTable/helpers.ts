import { Contact, Credential, Data } from "./ConnectionsTable.types";
import axios from "axios";
import { config } from "../../../../config";
import { fetchContacts } from "../../../../store/reducers/connectionsSlice";
import { AppDispatch } from "../../../../store";

const generateRows = (
  filteredContacts: Contact[],
  credentials: Credential[]
): Data[] => {
  return filteredContacts.map((contact) => {
    const contactCredentials = credentials.filter(
      (cred) => cred.contactId === contact.id
    );
    return {
      id: contact.id,
      name: contact.alias,
      date: "2020-03-15T12:34:56Z", // Temporary hardcoded date
      credentials: contactCredentials.length,
    };
  });
};

const handleDeleteContact = async (id: string, dispatch: AppDispatch) => {
  await axios.delete(`${config.endpoint}${config.path.deleteContact}?id=${id}`);
  await dispatch(fetchContacts());
};

export { generateRows, handleDeleteContact };
