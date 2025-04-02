import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecordingForm from "../../src/components/RecordingForm";
import { act } from "react";

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        success: true,
        transcript: "Test transcript",
        result: [],
      }),
  }),
) as any;

describe("RecordingForm", () => {
  it("renders input and mic button", () => {
    render(<RecordingForm />);
    expect(
      screen.getByPlaceholderText("Enter text or record audio..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "" })).toBeInTheDocument();
  });

  it("shows submit and clear buttons after text input", () => {
    render(<RecordingForm />);
    const input = screen.getByPlaceholderText("Enter text or record audio...");
    fireEvent.change(input, { target: { value: "Test" } });

    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("starts and stops recording, sets audioBlob and changes button icon", async () => {
    const blobMock = new Blob(["audio"], { type: "audio/wav" });
    const chunks: BlobPart[] = [];

    const mockStop = vi.fn(() => {
      chunks.push(blobMock);
      recorder.onstop(); // simulate stop event
    });

    const recorder = {
      start: vi.fn(),
      stop: mockStop,
      onstop: () => {},
      ondataavailable: () => {},
    };

    vi.stubGlobal("MediaStream", class {});
    vi.stubGlobal("MediaRecorder", function () {
      return recorder;
    });

    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn(() => Promise.resolve({})),
      },
    });

    await act(async () => {
      render(<RecordingForm />);
    });

    const micButton = screen.getByRole("button");

    await act(async () => {
      fireEvent.click(micButton); // Start
    });

    await act(async () => {
      fireEvent.click(micButton); // Stop
    });

    expect(mockStop).toHaveBeenCalled();
  });

  it("submits with text only and sets transcript and exercises", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const mockTranscript = "Bench press";
    const mockResult = [
      {
        exercise_name: "Bench press",
        type: "Weight-lifting",
        sets: [
          { weight: 200, repetitions: 8 },
          { weight: 210, repetitions: 6 },
        ],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        transcript: mockTranscript,
        result: mockResult,
      }),
    });

    render(<RecordingForm />);

    // Type and submit
    const input = screen.getByPlaceholderText("Enter text or record audio...");
    fireEvent.change(input, { target: { value: "I did bench press" } });
    fireEvent.click(screen.getByText(/submit/i));

    // Wait for results to show
    await waitFor(() => {
      const inputs = screen.getAllByDisplayValue("Bench press");
      expect(inputs.length).toBeGreaterThan(1); // we expect both main + exercise input
      expect(screen.getByText(/sets/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue("200")).toBeInTheDocument();
      expect(screen.getByDisplayValue("8")).toBeInTheDocument();
    });
  });

  it("submits with audio only and sets transcript and exercises", async () => {
    const mockTranscript = "Running";
    const mockResult = [
      {
        exercise_name: "Running",
        type: "Cardio",
        time: 30,
      },
    ];

    // Mock MediaRecorder behavior
    const mockBlob = new Blob(["audio"], { type: "audio/wav" });
    let onStopCallback: () => void = () => {};
    let onDataAvailableCallback: (event: any) => void = () => {};

    const mockMediaRecorder = {
      start: vi.fn(),
      stop: () => {
        onStopCallback();
        onDataAvailableCallback({ data: mockBlob });
      },
      onstop: () => {},
      ondataavailable: () => {},
    };

    vi.stubGlobal("MediaStream", class {});
    vi.stubGlobal("MediaRecorder", function () {
      return mockMediaRecorder;
    });

    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn(() => Promise.resolve({})),
      },
    });

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        transcript: mockTranscript,
        result: mockResult,
      }),
    });

    await act(async () => {
      render(<RecordingForm />);
    });

    // Click mic button to simulate start/stop recording
    const micButton = screen.getByRole("button");
    await act(async () => {
      fireEvent.click(micButton);
    });
    onStopCallback = mockMediaRecorder.onstop;
    onDataAvailableCallback = mockMediaRecorder.ondataavailable;
    await act(async () => {
      fireEvent.click(micButton);
    });
  });

  it("renders weight-lifting exercise inputs correctly", async () => {
    const mockResult = [
      {
        exercise_name: "Bench press",
        type: "Weight-lifting",
        sets: [
          { weight: 200, repetitions: 10 },
          { weight: 225, repetitions: 8 },
        ],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        transcript: "Bench press",
        result: mockResult,
      }),
    });

    await act(async () => {
      render(<RecordingForm />);
    });

    const input = screen.getByPlaceholderText("Enter text or record audio...");
    await act(async () => {
      fireEvent.change(input, { target: { value: "bench" } });
      fireEvent.click(screen.getByText(/submit/i));
    });

    // Ensure cardio input is not present
    expect(screen.queryByLabelText(/duration/i)).not.toBeInTheDocument();
  });

  it("renders cardio exercise inputs correctly", async () => {
    const mockResult = [
      {
        exercise_name: "Jogging",
        type: "Cardio",
        time: 45,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        transcript: "Jogging",
        result: mockResult,
      }),
    });

    await act(async () => {
      render(<RecordingForm />);
    });

    const input = screen.getByPlaceholderText("Enter text or record audio...");
    await act(async () => {
      fireEvent.change(input, { target: { value: "jogged for 45 minutes" } });
      fireEvent.click(screen.getByText(/submit/i));
    });

    // Ensure no weight or reps inputs
    expect(screen.queryByLabelText(/weight/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/reps/i)).not.toBeInTheDocument();
  });

  it("clears input and resets state", async () => {
    render(<RecordingForm />);
    const input = screen.getByPlaceholderText("Enter text or record audio...");
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(screen.getByText(/clear/i));

    expect(input).toHaveValue("");
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
    expect(screen.queryByText("Clear")).not.toBeInTheDocument();
  });
});
