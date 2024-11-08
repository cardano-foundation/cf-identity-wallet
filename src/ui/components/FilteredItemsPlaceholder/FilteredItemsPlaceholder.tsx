import { addOutline } from "ionicons/icons";
import { PageFooter } from "../PageFooter";
import { FilteredItemsPlaceholderProps } from "./FilteredItemsPlaceholder.types";
import "./FilteredItemsPlaceholder.scss";

const FilteredItemsPlaceholder = ({
  placeholderText,
  buttonLabel,
  buttonAction,
  testId,
}: FilteredItemsPlaceholderProps) => {
  return (
    <div
      className="filtered-items-placeholder-container"
      data-testid={`${testId}-filtered-items-placeholder`}
    >
      <p>
        <i>{placeholderText}</i>
      </p>
      {buttonLabel && buttonAction && (
        <PageFooter
          pageId={testId}
          primaryButtonIcon={addOutline}
          primaryButtonText={buttonLabel}
          primaryButtonAction={buttonAction}
        />
      )}
    </div>
  );
};

export { FilteredItemsPlaceholder };
