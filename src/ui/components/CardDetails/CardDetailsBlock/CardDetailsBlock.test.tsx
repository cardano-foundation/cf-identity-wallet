import { render } from "@testing-library/react";
import { CardDetailsBlock } from "./CardDetailsBlock";

describe("Card detail block", () => {
  test("Card details render", async () => {
    const { getByText } = render(<CardDetailsBlock title="Card title" />);

    expect(getByText("Card title")).toBeVisible();
  });

  test("Card details hidden title", async () => {
    const { queryByTestId } = render(<CardDetailsBlock />);

    expect(queryByTestId("card-details-info-block-title")).toBe(null);
  });
});
