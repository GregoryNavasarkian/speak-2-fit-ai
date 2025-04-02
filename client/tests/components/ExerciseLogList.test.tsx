import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExerciseLogList from "../../src/components/ExerciseLogList";

import { MemoryRouter } from "react-router-dom";
import useExerciseLogs from "../../src/hooks/useExerciseLogs";

// Mock the hook
vi.mock("../../src/hooks/useExerciseLogs", () => ({
  default: vi.fn(),
}));

const mockFetchExerciseLogs = vi.fn();
const mockUpdateExerciseLog = vi.fn();
const mockDeleteExerciseLog = vi.fn();

const mockLogs = [
  {
    _id: "67cc76fee14aa083edf8f723",
    log: {
      exercises: [
        {
          exercise_name: "Bench press",
          type: "Weight-lifting",
          sets: [
            { weight: 275, repetitions: 11 },
            { weight: 300, repetitions: 10 },
          ],
        },
      ],
    },
    dateTime: "2025-03-07T16:57:34.094Z",
  },
];

describe("ExerciseLogList", () => {
  beforeEach(() => {
    mockFetchExerciseLogs.mockResolvedValue(mockLogs);
    mockUpdateExerciseLog.mockReset();
    mockDeleteExerciseLog.mockReset();

    (useExerciseLogs as any).mockReturnValue({
      fetchExerciseLogs: mockFetchExerciseLogs,
      updateExerciseLog: mockUpdateExerciseLog,
      deleteExerciseLog: mockDeleteExerciseLog,
    });
  });

  it("renders logs after loading", async () => {
    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    // Wait for loading spinner to disappear
    await waitForElementToBeRemoved(() =>
      screen.getByTestId("loading-spinner"),
    );

    // Assert content is rendered
    expect(screen.getByDisplayValue("Bench press")).toBeInTheDocument();
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  it("shows loading spinner initially", async () => {
    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  it('shows "No exercise logs found" if log is empty', async () => {
    mockFetchExerciseLogs.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/no exercise logs found/i)).toBeInTheDocument();
    });
  });

  it("renders error message on fetch failure", async () => {
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockFetchExerciseLogs.mockRejectedValueOnce(new Error("Fetch failed"));

    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByText(/failed to fetch exercise logs/i);

    consoleErrorMock.mockRestore();
  });

  it("loads and formats logs on mount via useEffect", async () => {
    const logsOutOfOrder = [
      {
        _id: "log2",
        log: { exercises: [{ exercise_name: "Squats", sets: [] }] },
        dateTime: "2025-03-05T12:00:00.000Z",
      },
      {
        _id: "log1",
        log: { exercises: [{ exercise_name: "Bench press", sets: [] }] },
        dateTime: "2025-03-07T12:00:00.000Z",
      },
    ];

    mockFetchExerciseLogs.mockResolvedValueOnce(logsOutOfOrder);

    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Bench press");

    const benchPressInput = screen.getByDisplayValue("Bench press");
    const squatsInput = screen.getByDisplayValue("Squats");

    expect(benchPressInput).toBeInTheDocument();
    expect(squatsInput).toBeInTheDocument();

    const dateHeadings = screen.getAllByRole("heading", { level: 4 });
    expect(dateHeadings[0]).toHaveTextContent(/march 7/i);
    expect(dateHeadings[1]).toHaveTextContent(/march 5/i);
  });

  it("enters edit mode and sets tempExercises with a deep copy", async () => {
    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Bench press");

    // Click Edit
    fireEvent.click(screen.getByText(/edit/i));

    const input = screen.getByDisplayValue("Bench press") as HTMLInputElement;
    expect(input.disabled).toBe(false);
    fireEvent.change(input, { target: { value: "Incline Press" } });
    expect(input.value).toBe("Incline Press");
    fireEvent.click(screen.getByText(/cancel/i));
    expect(screen.getByDisplayValue("Bench press")).toBeInTheDocument();
  });

  it("groups logs by day correctly", async () => {
    mockFetchExerciseLogs.mockResolvedValueOnce([
      {
        _id: "log1",
        log: { exercises: [{ exercise_name: "Pushups", sets: [] }] },
        dateTime: "2025-03-10T08:00:00.000Z", // Monday
      },
      {
        _id: "log2",
        log: { exercises: [{ exercise_name: "Running", time: 30, sets: [] }] },
        dateTime: "2025-03-10T18:30:00.000Z", // same Monday
      },
    ]);

    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Pushups");
    await screen.findByDisplayValue("Running");

    // Should only be ONE date heading for both logs
    const dayHeadings = screen.getAllByRole("heading", { level: 4 });
    expect(dayHeadings.length).toBe(1);
    expect(dayHeadings[0]).toHaveTextContent(/monday, march 10, 2025/i);
  });

  it("toggles day expand/collapse", async () => {
    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Bench press");

    const toggleButton = screen.getByText(/march 7, 2025/i, { exact: false });
    expect(toggleButton).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(toggleButton);
  });

  it("toggles log expand/collapse for details", async () => {
    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Bench press");

    const detailsBtn = screen.getByRole("button", { name: /show details/i });
    fireEvent.click(detailsBtn);

    // Try checking a set input if it appears
    await screen.findByDisplayValue("275");
  });

  it("enters edit mode when Edit button is clicked", async () => {
    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Bench press");

    fireEvent.click(screen.getByText(/edit/i));
    expect(screen.getByText(/save/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it("cancels edit mode and hides save/cancel", async () => {
    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Bench press");
    fireEvent.click(screen.getByText(/edit/i));

    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/cancel/i));

    expect(screen.queryByText(/save/i)).not.toBeInTheDocument();
  });

  it("renders weight-lifting sets and updates weight + reps in edit mode", async () => {
    mockFetchExerciseLogs.mockResolvedValueOnce([
      {
        _id: "log1",
        log: {
          exercises: [
            {
              exercise_name: "Bench press",
              type: "Weight-lifting",
              sets: [
                { weight: 275, repetitions: 10 },
                { weight: 300, repetitions: 8 },
              ],
            },
          ],
        },
        dateTime: "2025-03-11T12:00:00.000Z",
      },
    ]);

    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Bench press");

    // Reveal sets UI
    fireEvent.click(screen.getByRole("button", { name: /show details/i }));

    // Should show weight and rep input fields
    const weightInput = screen.getByDisplayValue("275");
    const repsInput = screen.getByDisplayValue("10");

    expect(weightInput).toBeInTheDocument();
    expect(repsInput).toBeInTheDocument();

    // Enter edit mode
    fireEvent.click(screen.getByText(/edit/i));

    // Update the first set
    fireEvent.change(screen.getByDisplayValue("275"), {
      target: { value: "280" },
    });
    fireEvent.change(screen.getByDisplayValue("10"), {
      target: { value: "11" },
    });

    // Inputs should now show updated values
    expect(screen.getByDisplayValue("280")).toBeInTheDocument();
    expect(screen.getByDisplayValue("11")).toBeInTheDocument();

    // Cancel edit
    fireEvent.click(screen.getByText(/cancel/i));

    // Inputs should revert
    expect(screen.getByDisplayValue("275")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
  });

  it("filters logs when a date is selected", async () => {
    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Bench press");

    const input = screen.getByPlaceholderText("Select a date");
    await userEvent.type(input, "03/07/2025");
    fireEvent.blur(input);

    expect(screen.getByText(/march 7, 2025/i)).toBeInTheDocument();
  });

  it("clears date filter when Clear Filter is clicked", async () => {
    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Bench press");

    const input = screen.getByPlaceholderText("Select a date");
    await userEvent.type(input, "03/07/2025");
    fireEvent.blur(input);

    fireEvent.click(screen.getByText(/clear filter/i));

    expect(screen.getByText(/march 7, 2025/i)).toBeInTheDocument();
  });

  it("edits exercise name and triggers save", async () => {
    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Bench press");
    fireEvent.click(screen.getByText(/edit/i));

    const input = screen.getByDisplayValue("Bench press");
    fireEvent.change(input, { target: { value: "Incline Press" } });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(mockUpdateExerciseLog).toHaveBeenCalledWith(
        "67cc76fee14aa083edf8f723",
        expect.arrayContaining([
          expect.objectContaining({ exercise_name: "Incline Press" }),
        ]),
      );
    });
  });

  it("deletes exercise log and triggers delete", async () => {
    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Bench press");
    fireEvent.click(screen.getByText(/delete/i));

    await waitFor(() => {
      expect(mockDeleteExerciseLog).toHaveBeenCalledWith(
        "67cc76fee14aa083edf8f723",
      );
    });
  });

  //
  // Cardio log tests
  //

  it("renders a cardio log with time instead of sets", async () => {
    mockFetchExerciseLogs.mockResolvedValueOnce([
      {
        _id: "log2",
        log: {
          exercises: [
            {
              exercise_name: "Running",
              type: "Cardio",
              time: 45,
            },
          ],
        },
        dateTime: "2025-03-09T09:30:00.000Z",
      },
    ]);

    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Running");
    expect(screen.getByDisplayValue("45")).toBeInTheDocument();
  });

  it("enters edit mode for cardio log", async () => {
    mockFetchExerciseLogs.mockResolvedValueOnce([
      {
        _id: "log2",
        log: {
          exercises: [
            {
              exercise_name: "Running",
              type: "Cardio",
              time: 45,
            },
          ],
        },
        dateTime: "2025-03-09T09:30:00.000Z",
      },
    ]);

    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Running");

    fireEvent.click(screen.getByText(/edit/i));
    expect(screen.getByText(/save/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it("renders and updates cardio time input in edit mode", async () => {
    mockFetchExerciseLogs.mockResolvedValueOnce([
      {
        _id: "log1",
        log: {
          exercises: [
            {
              exercise_name: "Running",
              type: "Cardio",
              time: 45,
              sets: [],
            },
          ],
        },
        dateTime: "2025-03-12T09:00:00.000Z",
      },
    ]);

    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Running");

    // Reveal details
    fireEvent.click(screen.getByRole("button", { name: /show details/i }));

    // Check for initial time
    const timeInput = screen.getByDisplayValue("45");
    expect(timeInput).toBeInTheDocument();

    // Enter edit mode
    fireEvent.click(screen.getByText(/edit/i));

    // Update time to 60
    fireEvent.change(timeInput, { target: { value: "60" } });
    expect(screen.getByDisplayValue("60")).toBeInTheDocument();

    // Cancel edit
    fireEvent.click(screen.getByText(/cancel/i));
    expect(screen.getByDisplayValue("45")).toBeInTheDocument();
  });

  it("handles edit, save, and delete button actions", async () => {
    const mockUpdate = vi.fn();
    const mockDelete = vi.fn();

    mockFetchExerciseLogs.mockResolvedValueOnce([
      {
        _id: "log1",
        log: {
          exercises: [
            {
              exercise_name: "Rowing",
              type: "Cardio",
              time: 20,
              sets: [],
            },
          ],
        },
        dateTime: "2025-03-13T08:00:00.000Z",
      },
    ]);

    (useExerciseLogs as any).mockReturnValue({
      fetchExerciseLogs: mockFetchExerciseLogs,
      updateExerciseLog: mockUpdate,
      deleteExerciseLog: mockDelete,
    });

    render(
      <MemoryRouter>
        <ExerciseLogList />
      </MemoryRouter>,
    );

    await screen.findByDisplayValue("Rowing");

    // Click Edit
    fireEvent.click(screen.getByText(/edit/i));
    expect(screen.getByText(/save/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();

    // Update the input
    const input = screen.getByDisplayValue("Rowing");
    fireEvent.change(input, { target: { value: "Rowing Machine" } });

    // Click Save
    fireEvent.click(screen.getByText(/save/i));
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        "log1",
        expect.arrayContaining([
          expect.objectContaining({ exercise_name: "Rowing Machine" }),
        ]),
      );
    });

    // Delete should also work
    fireEvent.click(screen.getByText(/delete/i));
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("log1");
    });
  });
});
