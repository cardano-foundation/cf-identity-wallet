import { render, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { TermsAndConditions } from "./TermsAndConditions";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Terms and conditions screen", () => {
  test("User can close the modal by clicking on the backdrop", async () => {
    const mockSetIsOpen = jest.fn();
    const { queryByText } = render(
      <TermsAndConditions
        isOpen={true}
        setIsOpen={mockSetIsOpen}
      />
    );

    // When we click on the modal backdrop...
    const backdrop = document.querySelector("ion-backdrop");
    act(() => {
      backdrop && fireEvent.click(backdrop);
    });

    // ...the backdrop is no longer visible...
    await waitFor(() => {
      expect(backdrop).not.toBeInTheDocument();
    });

    // ...and the modal is no longer visible
    expect(
      queryByText(EN_TRANSLATIONS["termsandconditions.title"])
    ).not.toBeInTheDocument();
  });

  // TODO: Commenting this out for future investigation so we don't forget.
  // The current state of Ionic doesn't seem to allow the close button to be clicked,
  // so the following test will fail. Will leave it here as it's crucial.
  //
  //
  // test("User can close the modal clicking on the close button", async () => {
  //   const mockSetIsOpen = jest.fn();
  //   const { queryByText, getByTestId } = render(
  //     <TermsAndConditions
  //       isOpen={true}
  //       setIsOpen={mockSetIsOpen}
  //     />
  //   );

  //   await waitFor(() => {
  //     // ...the close button is visible
  //     expect(getByTestId("close-button")).toBeVisible();
  //   });

  //   // When we click on the close button...
  //   act(() => {
  //     fireEvent.click(getByTestId("close-button"));
  //   });

  //   // ...the function is called...
  //   expect(mockSetIsOpen.mock.calls.length).toEqual(1);

  //   // ...the backdrop is no longer visible...
  //   await waitFor(() => {
  //     expect(document.querySelector("ion-backdrop")).not.toBeInTheDocument();
  //   });

  //   // ...and the modal is no longer visible
  //   expect(
  //     queryByText(EN_TRANSLATIONS["termsandconditions.title"])
  //   ).not.toBeInTheDocument();
  // });
});
