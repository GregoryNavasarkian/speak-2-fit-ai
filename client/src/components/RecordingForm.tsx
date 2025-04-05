import React, { useState } from "react";
import { Form, Button, InputGroup, Spinner, Alert } from "react-bootstrap";
import { MicFill, MicMuteFill } from "react-bootstrap-icons";
import Exercise from "../types/exercise.type";

const RecordingForm: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(recordedBlob);
        setHasRecorded(true); // Ensure buttons appear
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();

      if (text) {
        formData.append("text", text);
      }

      if (audioBlob) {
        formData.append("file", audioBlob, "audio.wav");
      }

      const response = await fetch("/api/exercise-log/translate", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Server response:", result);

      if (!result.success) {
        throw new Error(result.message || "An error occurred.");
      }

      if (result.transcript) {
        setText(result.transcript);
      }

      if (result.result) {
        setExercises(result.result);
      }
    } catch (error) {
      setErrorMessage((error as Error).message || "An error occurred.");
      console.error("Error submitting:", error);
    }

    setIsLoading(false);
  };

  const handleClear = () => {
    setText("");
    setAudioBlob(null);
    setHasRecorded(false);
    setIsRecording(false);
    setExercises([]);
    setErrorMessage(null);
  };

  const handleExerciseChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: string | number,
  ) => {
    const updatedExercises = [...exercises];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updatedExercises[exerciseIndex] as any).sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  const handleSaveExercises = async () => {
    try {
      const response = await fetch("/api/exercise-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercises }),
      });

      const result = await response.json();
      console.log(result);
      handleClear();
    } catch (error) {
      setErrorMessage("Failed to add exercise.");
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <Form onSubmit={handleSubmit}>
        {/* Text Input with Mic Button */}
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Enter text or record audio..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            className={`${isRecording ? "speak-to-fit-cancel-btn" : "speak-to-fit-btn"}`}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
          >
            {isRecording ? <MicMuteFill /> : <MicFill />}
          </Button>
        </InputGroup>

        {/* Submit & Clear Buttons */}
        {(text || hasRecorded) && (
          <div className="mt-3 d-flex gap-2">
            <Button
              className="speak-to-fit-btn"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Spinner animation="border" size="sm" /> : "Submit"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClear}>
              Clear
            </Button>
          </div>
        )}
      </Form>

      {/* Display Exercise Data */}
      {exercises.length > 0 && (
        <div className="mt-4">
          {exercises.map((exercise, index) => (
            <div key={index} className="p-3 mb-3 border rounded">
              <Form.Group>
                <Form.Label>Exercise Name</Form.Label>
                <Form.Control
                  type="text"
                  value={exercise.exercise_name}
                  onChange={(e) =>
                    handleExerciseChange(index, "exercise_name", e.target.value)
                  }
                />
              </Form.Group>

              <Form.Group className="mt-2">
                <Form.Label>Type</Form.Label>
                <Form.Control
                  as="select"
                  value={exercise.type}
                  onChange={(e) =>
                    handleExerciseChange(index, "type", e.target.value)
                  }
                >
                  <option value="Weight-lifting">Weight-lifting</option>
                  <option value="Cardio">Cardio</option>
                </Form.Control>
              </Form.Group>

              {exercise.type === "Weight-lifting" && exercise.sets && (
                <>
                  <h6 className="mt-3">Sets</h6>
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="d-flex gap-2">
                      <Form.Group>
                        <Form.Label>Weight</Form.Label>
                        <Form.Control
                          type="number"
                          value={set.weight}
                          onChange={(e) =>
                            handleSetChange(
                              index,
                              setIndex,
                              "weight",
                              Number(e.target.value),
                            )
                          }
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>Reps</Form.Label>
                        <Form.Control
                          type="number"
                          value={set.repetitions}
                          onChange={(e) =>
                            handleSetChange(
                              index,
                              setIndex,
                              "repetitions",
                              Number(e.target.value),
                            )
                          }
                        />
                      </Form.Group>
                    </div>
                  ))}
                </>
              )}

              {exercise.type === "Cardio" && exercise.time && (
                <Form.Group className="mt-2">
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    value={exercise.time}
                    onChange={(e) =>
                      handleExerciseChange(
                        index,
                        "time",
                        Number(e.target.value),
                      )
                    }
                  />
                </Form.Group>
              )}
            </div>
          ))}

          {errorMessage && (
            <Alert variant="danger" className="mt-4">
              {errorMessage}
            </Alert>
          )}

          <Button
            variant="success"
            className="mt-2 speak-to-fit-btn"
            onClick={handleSaveExercises}
          >
            Save Exercise
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecordingForm;
