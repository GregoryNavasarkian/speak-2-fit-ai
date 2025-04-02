import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MainNavbar from "../../src/components/MainNavbar";

describe("MainNavbar", () => {
  it("renders navigation links", () => {
    render(
      <MemoryRouter>
        <MainNavbar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Speak2Fit")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Exercises")).toBeInTheDocument();
    expect(screen.getByText("Insights")).toBeInTheDocument();
  });
});
