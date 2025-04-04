import { Contact, Credential, Data } from "./ConnectionsTable.types";
import axios from "axios";
import { config } from "../../../../config";
import { fetchContacts } from "../../../../store/reducers/connectionsSlice";
import { AppDispatch } from "../../../../store";
import { VariantType } from "notistack";
import { i18n } from "../../../../i18n";

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
      date: new Date(contact.createdAt).getTime(),
      credentials: contactCredentials.length,
    };
  });
};

const handleDeleteContact = async (
  id: string,
  dispatch: AppDispatch,
  triggerToast: (message: string, variant: VariantType) => void
) => {
  try {
    const response = await axios.delete(
      `${config.endpoint}${config.path.deleteContact}?id=${id}`
    );
    if (response.status === 200) {
      triggerToast(
        i18n.t("pages.connections.deleteConnections.toast.success"),
        "success"
      );
    } else {
      triggerToast(
        i18n.t("pages.connections.deleteConnections.toast.error"),
        "error"
      );
    }
    await dispatch(fetchContacts());
  } catch (error) {
    triggerToast(
      i18n.t("pages.connections.deleteConnections.toast.error"),
      "error"
    );
    console.error("Error deleting contact:", error);
  }
};

export { generateRows, handleDeleteContact };
