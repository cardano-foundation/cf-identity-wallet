import { act, render } from "@testing-library/react";
import { ErrorMessage, MESSAGE_MILLISECONDS } from "./ErrorMessage";
import React from "react";

describe("ErrorMessage Component", () => {
  test("renders error message", () => {
    const { getByText } = render(<ErrorMessage message="Test error message" />);
    const message = getByText("Test error message");
    expect(message).toBeInTheDocument();
  });

  test("hide error message after 2 seconds", async () => {
    jest.useFakeTimers();
    const { getByTestId } = render(
      <ErrorMessage message="Test error message" />
    );

    const errorContainer = getByTestId("error-messsage");
    expect(errorContainer).toHaveClass("visible");
    await act(async () => {
      jest.advanceTimersByTime(MESSAGE_MILLISECONDS);
    });
    expect(errorContainer).not.toHaveClass("visible");
  });
});
