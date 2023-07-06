import { render, screen } from "@testing-library/react";
import { CryptoBalance } from "./index";

const items = [
  {
    title: "Slide 1",
    fiatBalance: "$100",
    nativeBalance: "341.73 ADA",
  },
];

describe("Slides Component", () => {
  test("Render slide 1", () => {
    render(<CryptoBalance items={items} />);
    const linkElement = screen.getByText(/Slide 1/i);
    expect(linkElement).toBeInTheDocument();
  });
});
