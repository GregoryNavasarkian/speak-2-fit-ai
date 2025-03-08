import { useState, useEffect, useCallback } from "react";
import Exercise from "../types/exercise.type";

const API_URL = "/api/exercise-log";

type ExerciseLogResponse = {
  _id: string;
  log: Exercise[] | { exercises: Exercise[] };
  dateTime: string;
};

const useExerciseLogs = () => {
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all exercise logs
  const fetchExerciseLogs = useCallback(async (): Promise<
    ExerciseLogResponse[]
  > => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch exercise logs");

      const data: ExerciseLogResponse[] = await response.json();

      // Ensure `log` is always an array
      const normalizedData = data.map((entry) => ({
        _id: entry._id,
        log: Array.isArray(entry.log)
          ? entry.log
          : (entry.log as { exercises: Exercise[] }).exercises || [],
        dateTime: entry.dateTime,
      }));

      setExerciseLogs(normalizedData);
      return normalizedData;
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an exercise log
  const updateExerciseLog = async (
    id: string,
    updatedExercises: Exercise[],
  ): Promise<Exercise[] | null> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercises: updatedExercises }),
      });

      if (!response.ok) throw new Error("Failed to update exercise log");

      await fetchExerciseLogs();
      return updatedExercises;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  // Delete an exercise log
  const deleteExerciseLog = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete exercise log");
      await fetchExerciseLogs();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchExerciseLogs(); // Fetch logs on mount
  }, [fetchExerciseLogs]);

  return {
    exerciseLogs,
    loading,
    error,
    fetchExerciseLogs,
    updateExerciseLog,
    deleteExerciseLog,
  };
};

export default useExerciseLogs;
