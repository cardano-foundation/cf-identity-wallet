import { render, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { VerifyPassword } from "./VerifyPassword";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { SecureStorage } from "../../../core/storage/secureStorage";

describe("Verify Password modal", () => {
  test.skip("User can close the modal by clicking on the backdrop", async () => {
    const mockSetIsOpen = jest.fn();
    const storedPass = "storedPass";
    const secureStorageGetMock = jest
      .spyOn(SecureStorage, "get")
      .mockResolvedValue(storedPass);
    const { queryByText, getByText, getByTestId } = render(
      <VerifyPassword
        isOpen={true}
        setIsOpen={mockSetIsOpen}
        action={() => {
          return;
        }}
      />
    );

    expect(getByTestId("verify-password")).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS["verifypassword.title"])).toBeVisible();

    const backdrop = document.querySelector("ion-backdrop");
    act(() => {
      backdrop && fireEvent.click(backdrop);
    });

    await waitFor(() => {
      expect(backdrop).not.toBeInTheDocument();
    });

    expect(queryByText(EN_TRANSLATIONS["verifypassword.title"])).toBeNull();
  });
});
