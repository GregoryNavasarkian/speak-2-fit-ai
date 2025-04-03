import { fireEvent, render, screen } from "@testing-library/react";
import Insights, { CustomTooltip } from "../../src/components/Insights";
import useExerciseLogs from "../../src/hooks/useExerciseLogs";

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("../../src/hooks/useExerciseLogs", () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe("Insights", () => {
  it("renders loading spinner", () => {
    (useExerciseLogs as any).mockReturnValue({
      exerciseLogs: [],
      loading: true,
      error: null,
    });

    render(<Insights />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays error message when error is present", () => {
    (useExerciseLogs as any).mockReturnValue({
      exerciseLogs: [],
      loading: false,
      error: "Something went wrong",
    });

    render(<Insights />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("renders default filters correctly", () => {
    (useExerciseLogs as any).mockReturnValue({
      exerciseLogs: [],
      loading: false,
      error: null,
    });

    render(<Insights />);

    // Start + end date inputs exist
    expect(screen.getByPlaceholderText("Start Date")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("End Date")).toBeInTheDocument();
  });

  it("filters data by date range", async () => {
    const mockLogs = [
      {
        _id: "1",
        dateTime: "2025-03-01T10:00:00Z", // inside range
        log: {
          exercises: [{ exercise_name: "Running", type: "Cardio", time: 20 }],
        },
      },
      {
        _id: "2",
        dateTime: "2025-03-15T10:00:00Z", // outside range
        log: {
          exercises: [{ exercise_name: "Running", type: "Cardio", time: 30 }],
        },
      },
    ];

    (useExerciseLogs as any).mockReturnValue({
      exerciseLogs: mockLogs,
      loading: false,
      error: null,
    });

    render(<Insights />);

    const [startInput, endInput] = screen.getAllByPlaceholderText(/date/i);

    // Enter date range: March 1–10
    fireEvent.change(startInput, { target: { value: "03/01/2025" } });
    fireEvent.blur(startInput);

    fireEvent.change(endInput, { target: { value: "03/10/2025" } });
    fireEvent.blur(endInput);

    // Assert out-of-range one is not
    expect(
      screen.queryByText((content) => content.includes("30")),
    ).not.toBeInTheDocument();
  });

  it("renders chart and table views when switching tabs", async () => {
    const mockLogs = [
      {
        _id: "1",
        dateTime: "2025-03-01T10:00:00Z",
        log: {
          exercises: [
            {
              exercise_name: "Running",
              type: "Cardio",
              time: 25,
            },
          ],
        },
      },
    ];

    (useExerciseLogs as any).mockReturnValue({
      exerciseLogs: mockLogs,
      loading: false,
      error: null,
    });

    render(<Insights />);

    // Click the Line Chart tab
    fireEvent.click(screen.getByRole("tab", { name: /line chart/i }));
    expect(screen.getByText(/time \(min\)/i)).toBeInTheDocument();

    // Click the Table View tab
    fireEvent.click(screen.getByRole("tab", { name: /table view/i }));
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("shows one item in table", () => {
    const mockLogs = [
      {
        _id: "1",
        dateTime: "2025-03-01T10:00:00Z",
        log: {
          exercises: [
            {
              exercise_name: "Cycling",
              type: "Cardio",
              time: 30,
            },
          ],
        },
      },
    ];

    (useExerciseLogs as any).mockReturnValue({
      exerciseLogs: mockLogs,
      loading: false,
      error: null,
    });

    render(<Insights />);

    // Switch to table view to verify empty state
    fireEvent.click(screen.getByRole("tab", { name: /table view/i }));

    // There should be no rows except the header
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(2);
  });

  it("displays error message when useExerciseLogs returns an error", () => {
    (useExerciseLogs as any).mockReturnValue({
      exerciseLogs: [],
      loading: false,
      error: "Something went wrong!",
    });

    render(<Insights />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});

describe("CustomTooltip", () => {
  it("renders Cardio tooltip content", () => {
    const cardioPayload = [
      {
        payload: {
          name: "Running",
          time: 30,
          date: "03/01/2025",
        },
      },
    ];

    const { getByText } = render(
      <CustomTooltip
        active={true}
        payload={cardioPayload}
        label="03/01/2025"
      />,
    );

    expect(getByText(/running/i)).toBeInTheDocument();
    expect(getByText(/date: 03\/01\/2025/i)).toBeInTheDocument();
    expect(getByText(/time: 30 min/i)).toBeInTheDocument();
  });

  it("renders Weight-lifting tooltip content", () => {
    const weightPayload = [
      {
        payload: {
          name: "Squat",
          averageWeight: 250,
          sets: [
            { weight: 200, repetitions: 5 },
            { weight: 250, repetitions: 5 },
          ],
          date: "03/02/2025",
        },
      },
    ];

    const { getByText } = render(
      <CustomTooltip
        active={true}
        payload={weightPayload}
        label="03/02/2025"
      />,
    );

    expect(getByText(/squat/i)).toBeInTheDocument();
    expect(getByText(/avg\. weight: 250 lbs/i)).toBeInTheDocument();
    expect(getByText(/sets: 200x5, 250x5/i)).toBeInTheDocument();
  });
});
