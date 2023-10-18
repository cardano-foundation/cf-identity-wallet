import { fireEvent, render, waitFor } from "@testing-library/react";
import { IdentityThemeSelector } from "./IdentityThemeSelector";

describe("Identity Theme Selector", () => {
  test("It switches from did:key 0 to did:key 1 theme", async () => {
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

    fireEvent.click(getByTestId("identity-theme-selector-item-01"));

    await waitFor(() => {
      expect(setNewSelectedTheme).toHaveBeenCalledWith(1);
    });
  });

  test("It switches from KERI 0 to KERI 1 theme", async () => {
    const setNewSelectedTheme = jest.fn();
    const { getByTestId } = render(
      <IdentityThemeSelector
        identityType={1}
        selectedTheme={0}
        setSelectedTheme={setNewSelectedTheme}
      />
    );

    await waitFor(() =>
      expect(getByTestId("identity-theme-selector")).toBeInTheDocument()
    );

    fireEvent.click(getByTestId("identity-theme-selector-item-11"));

    await waitFor(() => {
      expect(setNewSelectedTheme).toHaveBeenCalledWith(1);
    });
  });
});
