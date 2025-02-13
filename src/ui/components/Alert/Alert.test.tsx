import { render, waitFor } from "@testing-library/react";
import { Alert } from "./Alert";

describe("Render alert", () => {
  const isOpen = true;
  const setIsOpen = jest.fn();
  const actionConfirm = jest.fn();
  const actionCancel = jest.fn();
  const actionDismiss = jest.fn();

  test("Render", async () => {
    const { getByText } = render(
      <Alert
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        dataTestId="alert-confirm-delete-connection"
        headerText="Header"
        confirmButtonText="Confirm"
        cancelButtonText="Cancel"
        actionConfirm={actionConfirm}
        actionCancel={actionCancel}
        actionDismiss={actionDismiss}
      />
    );

    await waitFor(() => {
      expect(getByText("Header")).toBeVisible();
    });
    expect(getByText("Confirm")).toBeVisible();
    expect(getByText("Cancel")).toBeVisible();
  });
});
