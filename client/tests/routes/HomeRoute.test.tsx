import { render, screen, fireEvent } from "@testing-library/react";
import HomeRoute from "../../src/routes/HomeRoute";

// Mock the RecordingForm component
vi.mock("../../src/components/RecordingForm", () => ({
  default: () => <div>Recording Form</div>,
}));

describe("HomeRoute", () => {
  it("renders title and help button", () => {
    render(<HomeRoute />);
    expect(screen.getByText("Speak2Fit AI")).toBeInTheDocument();
    expect(
      screen.getByText("Need help? Click here for examples"),
    ).toBeInTheDocument();
  });

  it("shows help section when button is clicked", () => {
    render(<HomeRoute />);
    const helpButton = screen.getByText("Need help? Click here for examples");
    fireEvent.click(helpButton);

    expect(screen.getByText("Example Submissions")).toBeInTheDocument();
    expect(
      screen.getByText(/Bench press, 5 sets, 7 reps, 200 lbs./i),
    ).toBeInTheDocument();
  });
});
