import { fireEvent, render, waitFor } from "@testing-library/react";
import { IdentityThemeSelector } from "./IdentityThemeSelector";

describe("Identity Theme Selector", () => {
  test("It switches did:key from theme 0 to theme 1", async () => {
    const setNewSelectedTheme = jest.fn();
    const { getByTestId } = render(
      <IdentityThemeSelector
        identityType={0}
        selectedTheme={0}
        setSelectedTheme={setNewSelectedTheme}
      />
    );

    await waitFor(() =>
      expect(getByTestId("identity-theme-selector")).toBeInTheDocument()
    );

    fireEvent.click(getByTestId("identity-theme-selector-item-1"));

    await waitFor(() => {
      expect(setNewSelectedTheme).toHaveBeenCalledWith(1);
    });
  });

  test("It switches KERI card from theme 4 to theme 5", async () => {
    const setNewSelectedTheme = jest.fn();
    const { getByTestId } = render(
      <IdentityThemeSelector
        identityType={1}
        selectedTheme={4}
        setSelectedTheme={setNewSelectedTheme}
      />
    );

    await waitFor(() =>
      expect(getByTestId("identity-theme-selector")).toBeInTheDocument()
    );

    fireEvent.click(getByTestId("identity-theme-selector-item-4"));

    await waitFor(() => {
      expect(setNewSelectedTheme).toHaveBeenCalledWith(4);
    });
  });
});
