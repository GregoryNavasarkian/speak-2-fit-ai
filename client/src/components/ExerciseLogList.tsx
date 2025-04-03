import React, { useEffect, useState } from "react";
import {
  Button,
  Spinner,
  Alert,
  Card,
  Form,
  Row,
  Col,
  Collapse,
} from "react-bootstrap";
import useExerciseLogs from "../hooks/useExerciseLogs";
import Exercise from "../types/exercise.type";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type ExerciseLog = {
  _id: string;
  log: Exercise[];
  dateTime: string;
};

const ExerciseLogList: React.FC = () => {
  const { fetchExerciseLogs, updateExerciseLog, deleteExerciseLog } =
    useExerciseLogs();
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [tempExercises, setTempExercises] = useState<
    Record<string, Exercise[]>
  >({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const logs = await fetchExerciseLogs();
        const formattedLogs = logs
          .map((log) => ({
            _id: log._id,
            log: Array.isArray(log.log) ? log.log : log.log.exercises || [],
            dateTime: log.dateTime,
          }))
          .filter((log) => log.log.length > 0)
          .sort(
            (a, b) =>
              new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
          );

        setExerciseLogs(formattedLogs);
        if (formattedLogs.length > 0) {
          const firstDate = new Date(
            formattedLogs[0].dateTime,
          ).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          setExpandedDays({ [firstDate]: true });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch exercise logs.");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [fetchExerciseLogs]);

  const handleEdit = (id: string, exercises: Exercise[]) => {
    setEditingLogId(id);
    setTempExercises((prev) => ({
      ...prev,
      [id]: JSON.parse(JSON.stringify(exercises)),
    }));
  };

  const handleSave = async (id: string) => {
    if (!tempExercises[id]) return;
    await updateExerciseLog(id, tempExercises[id]);
    setExerciseLogs((prevLogs) =>
      prevLogs.map((log) =>
        log._id === id ? { ...log, log: tempExercises[id] } : log,
      ),
    );
    setEditingLogId(null);
  };

  const handleCancel = (id: string) => {
    setEditingLogId(null);
    setTempExercises((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExerciseLog(id);
      setExerciseLogs((prevLogs) => prevLogs.filter((log) => log._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete exercise log.");
    }
  };

  // Function to group logs by day
  const groupLogsByDay = (logs: ExerciseLog[]) => {
    return logs.reduce(
      (acc, log) => {
        const date = new Date(log.dateTime).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
      },
      {} as Record<string, ExerciseLog[]>,
    );
  };

  // Filter logs by selected day
  const filteredLogs = selectedDate
    ? exerciseLogs.filter(
        (log) =>
          new Date(log.dateTime).toLocaleDateString() ===
          selectedDate.toLocaleDateString(),
      )
    : exerciseLogs;

  const logsByDay = groupLogsByDay(filteredLogs);

  // Function to toggle expanded state of logs by day
  const handleToggleDay = (date: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // Function to toggle expanded state of individual logs
  const handleToggleLog = (id: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="container mt-4">
      <h2>Exercise Logs</h2>

      {loading && (
        <Spinner
          animation="border"
          data-testid="loading-spinner"
          role="status"
        />
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Date Picker for Filtering Logs */}
      <div className="mb-3">
        <Form.Label>Filter by Date:&nbsp;</Form.Label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          className="form-control"
          placeholderText="Select a date"
        />
        {selectedDate && (
          <Button
            variant="secondary"
            className="m-2"
            onClick={() => setSelectedDate(null)}
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Organized Logs by Day */}
      {Object.keys(logsByDay).length > 0
        ? Object.entries(logsByDay).map(([date, logs]) => (
            <div key={date} className="mb-4">
              <h4
                className="cursor-pointer"
                style={{ cursor: "pointer" }}
                onClick={() => handleToggleDay(date)}
              >
                {date} {expandedDays[date] ? "▲" : "▼"}
              </h4>
              <Collapse in={expandedDays[date]}>
                <div>
                  <Row className="g-2">
                    {logs.map((log) => (
                      <Col xs={12} sm={6} md={4} key={log._id}>
                        <Card
                          className="p-2 shadow-sm"
                          style={{ minHeight: "100%" }}
                        >
                          <Card.Body>
                            {log.log.map((exercise, exerciseIndex) => (
                              <div
                                key={`${log._id}-${exerciseIndex}`}
                                className="mb-2"
                              >
                                <Form.Group>
                                  <Form.Label className="small">
                                    Exercise Name
                                  </Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={
                                      editingLogId === log._id
                                        ? tempExercises[log._id]?.[
                                            exerciseIndex
                                          ]?.exercise_name || ""
                                        : exercise.exercise_name
                                    }
                                    onChange={(e) => {
                                      if (editingLogId !== log._id) return;
                                      setTempExercises((prev) => {
                                        const updatedExercises = prev[log._id]
                                          ? [...prev[log._id]]
                                          : [...log.log];
                                        updatedExercises[exerciseIndex] = {
                                          ...updatedExercises[exerciseIndex],
                                          exercise_name: e.target.value,
                                        };

                                        return {
                                          ...prev,
                                          [log._id]: updatedExercises,
                                        };
                                      });
                                    }}
                                    disabled={editingLogId !== log._id}
                                  />
                                </Form.Group>

                                <Button
                                  variant="link"
                                  className="p-0 mt-2"
                                  onClick={() => handleToggleLog(log._id)}
                                >
                                  {expandedLogs[log._id]
                                    ? "Hide Details ▲"
                                    : "Show Details ▼"}
                                </Button>

                                <Collapse in={expandedLogs[log._id]}>
                                  <div>
                                    {exercise.sets &&
                                    exercise.sets.length > 0 ? (
                                      <Form.Group className="mt-2">
                                        <Form.Label className="small">
                                          Sets
                                        </Form.Label>
                                        {exercise.sets.map((set, setIndex) => (
                                          <div
                                            key={setIndex}
                                            className="d-flex gap-2 align-items-center mt-1"
                                          >
                                            <Form.Group>
                                              <Form.Label className="small">
                                                Weight (lbs)
                                              </Form.Label>
                                              <Form.Control
                                                type="number"
                                                value={
                                                  editingLogId === log._id
                                                    ? tempExercises[log._id]?.[
                                                        exerciseIndex
                                                      ]?.sets?.[setIndex]
                                                        ?.weight || ""
                                                    : set.weight
                                                }
                                                onChange={(e) => {
                                                  if (editingLogId !== log._id)
                                                    return;

                                                  setTempExercises((prev) => {
                                                    const newExercises = prev[
                                                      log._id
                                                    ]
                                                      ? [...prev[log._id]]
                                                      : [...log.log];

                                                    if (
                                                      !newExercises[
                                                        exerciseIndex
                                                      ]
                                                    )
                                                      return prev;

                                                    const updatedSets = [
                                                      ...(newExercises[
                                                        exerciseIndex
                                                      ].sets || []),
                                                    ];
                                                    if (!updatedSets[setIndex])
                                                      return prev;

                                                    updatedSets[setIndex] = {
                                                      ...updatedSets[setIndex],
                                                      weight: Number(
                                                        e.target.value,
                                                      ),
                                                    };

                                                    newExercises[
                                                      exerciseIndex
                                                    ] = {
                                                      ...newExercises[
                                                        exerciseIndex
                                                      ],
                                                      sets: updatedSets,
                                                    };

                                                    return {
                                                      ...prev,
                                                      [log._id]: newExercises,
                                                    };
                                                  });
                                                }}
                                                disabled={
                                                  editingLogId !== log._id
                                                }
                                              />
                                            </Form.Group>

                                            <Form.Group>
                                              <Form.Label className="small">
                                                Reps
                                              </Form.Label>
                                              <Form.Control
                                                type="number"
                                                value={
                                                  editingLogId === log._id
                                                    ? tempExercises[log._id]?.[
                                                        exerciseIndex
                                                      ]?.sets?.[setIndex]
                                                        ?.repetitions || ""
                                                    : set.repetitions
                                                }
                                                onChange={(e) => {
                                                  if (editingLogId !== log._id)
                                                    return;

                                                  setTempExercises((prev) => {
                                                    const newExercises = prev[
                                                      log._id
                                                    ]
                                                      ? [...prev[log._id]]
                                                      : [...log.log];

                                                    if (
                                                      !newExercises[
                                                        exerciseIndex
                                                      ]
                                                    )
                                                      return prev;

                                                    const updatedSets = [
                                                      ...(newExercises[
                                                        exerciseIndex
                                                      ].sets || []),
                                                    ];
                                                    if (!updatedSets[setIndex])
                                                      return prev;

                                                    updatedSets[setIndex] = {
                                                      ...updatedSets[setIndex],
                                                      repetitions: Number(
                                                        e.target.value,
                                                      ),
                                                    };

                                                    newExercises[
                                                      exerciseIndex
                                                    ] = {
                                                      ...newExercises[
                                                        exerciseIndex
                                                      ],
                                                      sets: updatedSets,
                                                    };

                                                    return {
                                                      ...prev,
                                                      [log._id]: newExercises,
                                                    };
                                                  });
                                                }}
                                                disabled={
                                                  editingLogId !== log._id
                                                }
                                              />
                                            </Form.Group>
                                          </div>
                                        ))}
                                      </Form.Group>
                                    ) : (
                                      <Form.Group className="mt-2">
                                        <Form.Label className="small">
                                          Time (minutes)
                                        </Form.Label>
                                        <Form.Control
                                          type="number"
                                          value={
                                            editingLogId === log._id
                                              ? tempExercises[log._id]?.[
                                                  exerciseIndex
                                                ]?.time || ""
                                              : exercise.time || ""
                                          }
                                          onChange={(e) => {
                                            if (editingLogId !== log._id)
                                              return;

                                            setTempExercises((prev) => {
                                              const newExercises = prev[log._id]
                                                ? [...prev[log._id]]
                                                : [...log.log];

                                              if (!newExercises[exerciseIndex])
                                                return prev;

                                              newExercises[exerciseIndex] = {
                                                ...newExercises[exerciseIndex],
                                                time: Number(e.target.value),
                                              };

                                              return {
                                                ...prev,
                                                [log._id]: newExercises,
                                              };
                                            });
                                          }}
                                          disabled={editingLogId !== log._id}
                                        />
                                      </Form.Group>
                                    )}
                                  </div>
                                </Collapse>
                              </div>
                            ))}

                            {editingLogId === log._id ? (
                              <>
                                <Button
                                  variant="success"
                                  className="mt-2 me-2"
                                  onClick={() => handleSave(log._id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="secondary"
                                  className="mt-2"
                                  onClick={() => handleCancel(log._id)}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="primary"
                                className="mt-2 me-2"
                                onClick={() => handleEdit(log._id, log.log)}
                              >
                                Edit
                              </Button>
                            )}

                            {editingLogId !== log._id && (
                              <Button
                                variant="danger"
                                className="mt-2"
                                onClick={() => handleDelete(log._id)}
                              >
                                Delete
                              </Button>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Collapse>
            </div>
          ))
        : !loading && <p>No exercise logs found.</p>}
    </div>
  );
};

export default ExerciseLogList;
