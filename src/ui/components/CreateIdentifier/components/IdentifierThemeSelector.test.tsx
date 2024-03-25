import { fireEvent, render, waitFor } from "@testing-library/react";
import { IdentifierThemeSelector } from "./IdentifierThemeSelector";

describe("Identifier Theme Selector", () => {
  test("It switches did:key from theme 0 to theme 1", async () => {
    const setNewSelectedTheme = jest.fn();
    const { getByTestId } = render(
      <IdentifierThemeSelector
        identifierType={0}
        selectedTheme={0}
        setSelectedTheme={setNewSelectedTheme}
      />
    );

    await waitFor(() =>
      expect(getByTestId("identifier-theme-selector")).toBeInTheDocument()
    );

    fireEvent.click(getByTestId("identifier-theme-selector-item-1"));

    await waitFor(() => {
      expect(setNewSelectedTheme).toHaveBeenCalledWith(1);
    });
  });

  test("It switches KERI card from theme 4 to theme 5", async () => {
    const setNewSelectedTheme = jest.fn();
    const { getByTestId } = render(
      <IdentifierThemeSelector
        identifierType={1}
        selectedTheme={4}
        setSelectedTheme={setNewSelectedTheme}
      />
    );

    await waitFor(() =>
      expect(getByTestId("identifier-theme-selector")).toBeInTheDocument()
    );

    fireEvent.click(getByTestId("identifier-theme-selector-item-4"));

    await waitFor(() => {
      expect(setNewSelectedTheme).toHaveBeenCalledWith(4);
    });
  });
});
