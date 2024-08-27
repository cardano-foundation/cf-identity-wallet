import { fireEvent, RenderResult, waitFor } from "@testing-library/react";

const passcodeFiller = async (
  getByText: RenderResult["getByText"],
  getByTestId: RenderResult["getByTestId"],
  buttonLabel: string,
  times: number
) => {
  for (let i = 0; i < times; i++) {
    fireEvent.click(getByText(buttonLabel));

    await waitFor(() => {
      expect(
        getByTestId("circle-" + i).classList.contains(
          "passcode-module-circle-fill"
        )
      ).toBe(true);
    });
  }
};

export { passcodeFiller };
