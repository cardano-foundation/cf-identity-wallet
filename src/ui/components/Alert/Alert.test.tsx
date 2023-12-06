import { render } from "@testing-library/react";
import { Alert } from "./Alert";

describe("ConnectionDetails Page", () => {
  const isOpen = true;
  const setIsOpen = jest.fn();
  const actionConfirm = jest.fn();
  const actionCancel = jest.fn();
  const actionDismiss = jest.fn();

  test.skip("Open and close ConnectionDetails", async () => {
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

    expect(getByText("Header")).toBeVisible();
    expect(getByText("Confirm")).toBeVisible();
    expect(getByText("Cancel")).toBeVisible();
  });
});
