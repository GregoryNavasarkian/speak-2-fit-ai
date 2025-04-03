import { render, screen } from "@testing-library/react";
import InsightRoute from "../../src/routes/InsightRoute";

// Mock the Insights component
vi.mock("../../src/components/Insights", () => ({
  default: () => <div>Insights Content</div>,
}));

describe("InsightRoute", () => {
  it("renders Insights component", () => {
    render(<InsightRoute />);
    expect(screen.getByText("Insights Content")).toBeInTheDocument();
  });
});
