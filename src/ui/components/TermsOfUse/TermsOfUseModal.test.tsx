import { render, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { TermsOfUseModal } from "./TermsOfUseModal";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Terms and conditions screen", () => {
  test("User can close the modal by clicking on the backdrop", async () => {
    const mockSetIsOpen = jest.fn();
    const { queryByText, getByTestId } = render(
      <TermsOfUseModal
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

    expect(
      queryByText(EN_TRANSLATIONS.termsofusedata.intro.title)
    ).not.toBeInTheDocument();
  });

  test.skip("User can close the modal clicking on the close button", async () => {
    const mockSetIsOpen = jest.fn();
    const { queryByText, getByTestId } = render(
      <TermsOfUseModal
        isOpen={true}
        setIsOpen={mockSetIsOpen}
      />
    );

    await waitFor(() => {
      expect(getByTestId("close-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("close-button"));
    });

    expect(mockSetIsOpen.mock.calls.length).toEqual(1);

    await waitFor(() => {
      expect(document.querySelector("ion-backdrop")).not.toBeInTheDocument();
    });

    expect(
      queryByText(EN_TRANSLATIONS.termsofusedata.intro.title)
    ).not.toBeInTheDocument();
  });
});
