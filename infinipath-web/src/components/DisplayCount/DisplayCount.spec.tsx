import { screen, render } from "@testing-library/react";
import { DisplayCount } from "./index";
import "@testing-library/jest-dom";

describe("DisplayCount", () => {
  it("should render the DisplayCount component", () => {
    render(<DisplayCount userName="User" count={5} />);
    const countHeading = screen.getByTestId("display-count");
    const count = screen.getByTestId("count");
    expect(countHeading).toHaveTextContent("Hello User");
    expect(count).toHaveTextContent("5");
  });
});
