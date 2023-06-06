import { act, fireEvent, render } from "@testing-library/react";
import { CardsPlaceholder } from "./CardsPlaceholder";

describe("Cards Placeholder Component", () => {
  test("It renders Cards Placeholder", () => {
    const action = jest.fn();
    const { getByText } = render(
      <CardsPlaceholder
        buttonLabel="Button"
        buttonAction={action}
      />
    );
    const button = getByText("Button");
    expect(button).toBeInTheDocument();

    act(() => {
      fireEvent.click(button);
    });

    expect(action).toHaveBeenCalledTimes(1);
  });
});
