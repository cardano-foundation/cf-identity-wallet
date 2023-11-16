import { fireEvent, render } from "@testing-library/react";
import { PasscodeModule } from "./PasscodeModule";

describe("Passcode Module", () => {
  const errorFunction = jest.fn();
  let handlePinChange = jest.fn(() => 0);
  const handleRemove = jest.fn();

  test("Clicking on a number button returns a digit", () => {
    const { getByText } = render(
      <PasscodeModule
        error={errorFunction()}
        passcode="passcode"
        handlePinChange={handlePinChange}
        handleRemove={handleRemove()}
      />
    );
    for (let i = 0; i < 9; i++) {
      const buttonElement = getByText(i);
      fireEvent.click(buttonElement);
      expect(handlePinChange()).toBe(i);
      handlePinChange = jest.fn(() => i + 1);
    }
  });
});
