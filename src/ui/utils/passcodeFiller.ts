import { fireEvent, RenderResult, waitFor } from "@testing-library/react";
import { act } from "react";

const passcodeFiller = async (
  getByText: RenderResult["getByText"],
  getByTestId: RenderResult["getByTestId"],
  text: string
) => {
  for (let i = 0; i < text.length; i++) {
    act(() => {
      fireEvent.click(getByText(text[i]));
    });

    await waitFor(() => {
      expect(
        getByTestId("circle-" + i).classList.contains(
          "passcode-module-circle-fill"
        )
      ).toBe(true);
    });
  }
};

const passcodeFillerWithAct = async (
  getByText: RenderResult["getByText"],
  getByTestId: RenderResult["getByTestId"],
  text: string
) => {
  const fillText = text.slice(0, text.length - 1);
  await passcodeFiller(getByText, getByTestId, fillText);

  fireEvent.click(getByText(text.charAt(text.length - 1)));

  await act(async () => {
    await waitFor(() => {
      expect(
        getByTestId("circle-" + (text.length - 1)).classList.contains(
          "passcode-module-circle-fill"
        )
      ).toBe(true);
    });
  });
};

export { passcodeFiller, passcodeFillerWithAct };
