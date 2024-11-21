import { fireEvent, RenderResult, waitFor } from "@testing-library/react";
import { act } from "react";

const passcodeFiller = async (
  getByText: RenderResult["getByText"],
  getByTestId: RenderResult["getByTestId"],
  buttonLabel: string,
  times: number
) => {
  for (let i = 0; i < times; i++) {
    act(() => {
      fireEvent.click(getByText(buttonLabel));
    })

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
  buttonLabel: string,
  times: number
) => {
  await passcodeFiller(getByText, getByTestId, buttonLabel, times - 1);

  fireEvent.click(getByText(buttonLabel));

  await act(async () => {
    await waitFor(() => {
      expect(
        getByTestId("circle-" + (times - 1)).classList.contains(
          "passcode-module-circle-fill"
        )
      ).toBe(true);
    });
  });
};

export { passcodeFiller, passcodeFillerWithAct};
