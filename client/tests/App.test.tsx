import { render, screen } from "@testing-library/react";
import App from "../src/App";

vi.mock("../src/components/MainNavbar", () => ({
  default: () => <div>Navbar</div>,
}));
vi.mock("../src/routes/HomeRoute", () => ({
  default: () => <div>Home</div>,
}));
vi.mock("../src/routes/ExercisesRoute", () => ({
  default: () => <div>Exercises</div>,
}));
vi.mock("../src/routes/InsightRoute", () => ({
  default: () => <div>Insights</div>,
}));

describe("App", () => {
  it("renders navbar and home route by default", () => {
    render(<App />);
    expect(screen.getByText("Navbar")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});
