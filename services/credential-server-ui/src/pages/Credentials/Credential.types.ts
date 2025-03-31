import { AppTableBaseData } from "../../components/AppTable/AppTable.types";

interface CredentialTemplateRow extends AppTableBaseData {
  name: string;
  date: number;
}

export type { CredentialTemplateRow };
