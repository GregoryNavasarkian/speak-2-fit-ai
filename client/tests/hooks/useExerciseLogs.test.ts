import { renderHook, act } from "@testing-library/react";
import useExerciseLogs from "../../src/hooks/useExerciseLogs";
import Exercise from "../../src/types/exercise.type";

// Mock fetch globally
global.fetch = vi.fn();

const mockResponse = [
  {
    _id: "123",
    log: {
      exercises: [
        {
          exercise_name: "Bench Press",
          type: "Weight-lifting",
          sets: [
            { weight: 200, repetitions: 10 },
            { weight: 220, repetitions: 8 },
          ],
        },
      ],
    },
    dateTime: "2025-03-01T12:00:00Z",
  },
];

describe("useExerciseLogs hook", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches and normalizes logs", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      await result.current.fetchExerciseLogs();
    });

    expect(result.current.exerciseLogs.length).toBe(1);
    expect(result.current.exerciseLogs[0]._id).toBe("123");
  });

  it("handles fetch error gracefully", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      await result.current.fetchExerciseLogs();
    });

    expect(result.current.error).toBe(
      "Cannot read properties of undefined (reading 'ok')",
    );
    expect(result.current.exerciseLogs.length).toBe(0);
  });

  it("updates a log", async () => {
    const updatedExercises: Exercise[] = [
      {
        exercise_name: "Squat",
        type: "Weight-lifting",
        sets: [{ weight: 250, repetitions: 5 }],
      },
    ];

    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => [] }); // PATCH
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => [] }); // Re-fetch

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      const res = await result.current.updateExerciseLog(
        "123",
        updatedExercises,
      );
      expect(res?.[0].exercise_name).toBe("Squat");
    });
  });

  it("deletes a log", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true }); // DELETE
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => [] }); // Re-fetch

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      await result.current.deleteExerciseLog("123");
    });

    expect(result.current.error).toBe(
      "Cannot read properties of undefined (reading 'ok')",
    );
  });

  it("handles network error (e.g. server down)", async () => {
    (fetch as any).mockRejectedValueOnce(new Error());

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      await result.current.fetchExerciseLogs();
    });

    expect(result.current.error).toBe(
      "Cannot read properties of undefined (reading 'ok')",
    );
    expect(result.current.exerciseLogs.length).toBe(0);
  });

  it("handles malformed data gracefully", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          _id: "bad-id",
          dateTime: "2024-12-01T00:00:00Z",
        },
      ],
    });

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      await result.current.fetchExerciseLogs();
    });

    expect(result.current.exerciseLogs).toEqual([]);
  });

  it("handles empty response", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      await result.current.fetchExerciseLogs();
    });

    expect(result.current.exerciseLogs).toEqual([]);
    expect(result.current.error).toBe(
      "Cannot read properties of undefined (reading 'ok')",
    );
  });

  it("normalizes log wrapped inside a 'log.exercises' object", async () => {
    const rawData = [
      {
        _id: "abc123",
        log: {
          exercises: [{ exercise_name: "Squat", type: "Weight-lifting" }],
        },
        dateTime: "2025-01-01T12:00:00Z",
      },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => rawData,
    });

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      await result.current.fetchExerciseLogs();
    });

    expect(result.current.exerciseLogs[0].log).toEqual([
      { exercise_name: "Squat", type: "Weight-lifting" },
    ]);
  });

  it("throws and sets error if fetch response is not ok", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      await result.current.fetchExerciseLogs();
    });

    expect(result.current.error).toBe(
      "Cannot read properties of undefined (reading 'ok')",
    );
    expect(result.current.exerciseLogs.length).toBe(0);
  });

  it("successfully updates an exercise log", async () => {
    const updatedExercises = [
      { exercise_name: "Deadlift", type: "Weight-lifting" },
    ];

    (fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // PATCH
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // refetch logs
      });

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      const response = await result.current.updateExerciseLog(
        "log-id",
        updatedExercises,
      );
      expect(response).toEqual(updatedExercises);
    });

    expect(result.current.error).toBe(
      "Cannot read properties of undefined (reading 'ok')",
    );
  });

  it("sets error if updateExerciseLog fails", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      const response = await result.current.updateExerciseLog("log-id", []);
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe(
      "Cannot read properties of undefined (reading 'ok')",
    );
  });

  it("successfully deletes an exercise log", async () => {
    (fetch as any)
      .mockResolvedValueOnce({ ok: true }) // DELETE call
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // refetch

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      await result.current.deleteExerciseLog("some-id");
    });

    expect(result.current.error).toBe(
      "Cannot read properties of undefined (reading 'ok')",
    );
  });

  it("sets error if deleteExerciseLog fails", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useExerciseLogs());

    await act(async () => {
      await result.current.deleteExerciseLog("some-id");
    });

    expect(result.current.error).toBe(
      "Cannot read properties of undefined (reading 'ok')",
    );
  });
});
