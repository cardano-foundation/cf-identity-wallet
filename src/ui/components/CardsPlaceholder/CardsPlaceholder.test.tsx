import { fireEvent, render } from "@testing-library/react";
import { act } from "react";
import { CardsPlaceholder } from "./CardsPlaceholder";

describe("Cards Placeholder Component", () => {
  test("It renders Cards Placeholder", () => {
    const action = jest.fn();
    const { getByText } = render(
      <CardsPlaceholder
        buttonLabel="Button"
        buttonAction={action}
        testId="cards-placeholder"
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
