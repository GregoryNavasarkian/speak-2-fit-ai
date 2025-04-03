import { render, screen } from "@testing-library/react";
import ExercisesRoute from "../../src/routes/ExercisesRoute";

// Mock the ExerciseLogList component
vi.mock("../../src/components/ExerciseLogList", () => ({
  default: () => <div>Exercise Logs</div>,
}));

describe("ExercisesRoute", () => {
  it("renders ExerciseLogList component", () => {
    render(<ExercisesRoute />);
    expect(screen.getByText("Exercise Logs")).toBeInTheDocument();
  });
});
