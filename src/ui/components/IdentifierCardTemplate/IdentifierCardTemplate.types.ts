import { CSSProperties } from "react";
import { IdentifierShortDetails } from "../../../core/agent/services/singleSig.types";

interface IdentifierCardTemplateProps {
  name?: string;
  cardData: IdentifierShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
  styles?: CSSProperties;
}

export type { IdentifierCardTemplateProps };
