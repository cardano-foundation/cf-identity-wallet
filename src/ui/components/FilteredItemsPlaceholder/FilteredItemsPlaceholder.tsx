import { addOutline } from "ionicons/icons";
import { PageFooter } from "../PageFooter";
import { FilteredItemsPlaceholderProps } from "./FilteredItemsPlaceholder.types";

const FilteredItemsPlaceholder = ({
  placeholderText,
  buttonLabel,
  buttonAction,
  testId,
}: FilteredItemsPlaceholderProps) => {
  return (
    <div
      className="filters-placeholder-container"
      data-testid={`${testId}-filters-placeholder`}
    >
      <p className="filters-placeholder-text">
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
