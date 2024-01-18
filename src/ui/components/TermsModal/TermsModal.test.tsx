import { render, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { TermsModal } from "./TermsModal";

describe("Terms and conditions screen", () => {
  test("User can close the modal by clicking on the backdrop", async () => {
    const mockSetIsOpen = jest.fn();
    const { getByTestId } = render(
      <TermsModal
        name="terms-of-use"
        isOpen={true}
        setIsOpen={mockSetIsOpen}
      />
    );

    await waitFor(() => {
      expect(getByTestId("terms-of-use-modal")).toBeVisible();
    });

    const backdrop = document.querySelector("ion-backdrop");
    act(() => {
      backdrop && fireEvent.click(backdrop);
    });

    await waitFor(() => {
      expect(backdrop).not.toBeInTheDocument();
    });
  });
});
