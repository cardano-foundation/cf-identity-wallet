import { render } from "@testing-library/react";
import { act } from "react";
import { ErrorMessage, MESSAGE_MILLISECONDS } from "./ErrorMessage";

describe("ErrorMessage Component", () => {
  test("renders error message", () => {
    const { getByText } = render(
      <ErrorMessage
        message="Test error message"
        timeout={true}
      />
    );
    const message = getByText("Test error message");
    expect(message).toBeInTheDocument();
  });

  test("hide error message after 2 seconds", async () => {
    jest.useFakeTimers();
    const { getByTestId } = render(
      <ErrorMessage
        message="Test error message"
        timeout={true}
      />
    );

    const errorContainer = getByTestId("error-message");
    expect(errorContainer).toHaveClass("visible");
    act(() => {
      jest.advanceTimersByTime(MESSAGE_MILLISECONDS);
    });
    expect(errorContainer).not.toHaveClass("visible");
  });
});
