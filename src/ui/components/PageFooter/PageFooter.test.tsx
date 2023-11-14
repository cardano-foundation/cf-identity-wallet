import { fireEvent, render } from "@testing-library/react";
import PageFooter from "./PageFooter";

describe("Page Footer", () => {
  const pageId = "test-page";
  const primaryButtonText = "primaryButtonText";
  const primaryButtonAction = jest.fn();
  const secondaryButtonText = "secondaryButtonText";
  const secondaryButtonAction = jest.fn();
  const tertiaryButtonText = "tertiaryButtonText";
  const tertiaryButtonAction = jest.fn();

  test("Renders all enabled buttons + page id", () => {
    const { getByText, getByTestId } = render(
      <PageFooter
        pageId={pageId}
        primaryButtonText={primaryButtonText}
        primaryButtonAction={primaryButtonAction}
        secondaryButtonText={secondaryButtonText}
        secondaryButtonAction={secondaryButtonAction}
        tertiaryButtonText={tertiaryButtonText}
        tertiaryButtonAction={tertiaryButtonAction}
      />
    );

    expect(getByText(primaryButtonText)).toBeInTheDocument();
    expect(getByText(secondaryButtonText)).toBeInTheDocument();
    expect(getByText(tertiaryButtonText)).toBeInTheDocument();

    fireEvent.click(getByTestId(`primary-button${`-${pageId}`}`));
    expect(primaryButtonAction.mock.calls.length).toEqual(1);

    fireEvent.click(getByTestId(`secondary-button${`-${pageId}`}`));
    expect(secondaryButtonAction.mock.calls.length).toEqual(1);

    fireEvent.click(getByTestId(`tertiary-button${`-${pageId}`}`));
    expect(tertiaryButtonAction.mock.calls.length).toEqual(1);
  });

  test("Renders all disabled buttons + no page id", () => {
    const { getByText, getByTestId } = render(
      <PageFooter
        primaryButtonText={primaryButtonText}
        primaryButtonAction={primaryButtonAction}
        primaryButtonDisabled={true}
        secondaryButtonText={secondaryButtonText}
        secondaryButtonAction={secondaryButtonAction}
        secondaryButtonDisabled={true}
        tertiaryButtonText={tertiaryButtonText}
        tertiaryButtonAction={tertiaryButtonAction}
        tertiaryButtonDisabled={true}
      />
    );

    expect(getByText(primaryButtonText)).toBeInTheDocument();
    expect(getByText(secondaryButtonText)).toBeInTheDocument();
    expect(getByText(tertiaryButtonText)).toBeInTheDocument();

    expect(getByTestId("primary-button")).toHaveAttribute("disabled", "true");
    expect(getByTestId("secondary-button")).toHaveAttribute("disabled", "true");
    expect(getByTestId("tertiary-button")).toHaveAttribute("disabled", "true");
  });
});
