import React, { useState } from "react";
import { Form, Button, InputGroup, Spinner, Alert } from "react-bootstrap";
import { MicFill, MicMuteFill } from "react-bootstrap-icons";
import ExerciseCard from "./ExerciseCard";
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
  const [, setTranscribedText] = useState<string>("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

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
        setTranscribedText(result.transcript);
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
    setTranscribedText("");
    setExercises([]);
    setErrorMessage(null);
  };

  const handleAddExercise = async () => {
    try {
      const response = await fetch("/api/exercise-log/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercises }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to add exercise.");
      }

      alert("Exercise added successfully!");
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
            style={{
              backgroundColor: isRecording ? "#dc3545" : "#61ac85",
              borderColor: isRecording ? "#dc3545" : "#61ac85",
            }}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
          >
            {isRecording ? <MicMuteFill /> : <MicFill />}
          </Button>
        </InputGroup>

        {/* Submit & Clear Buttons */}
        {(text || hasRecorded) && (
          <div className="mt-3 d-flex gap-2">
            <Button
              type="submit"
              style={{
                backgroundColor: "#61ac85",
                borderColor: "#61ac85",
              }}
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
            <ExerciseCard key={index} exercise={exercise} />
          ))}

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="danger" className="mt-4">
              {errorMessage}
            </Alert>
          )}

          <Button
            style={{
              backgroundColor: "#61ac85",
              borderColor: "#61ac85",
            }}
            variant="success"
            className="mt-2"
            onClick={handleAddExercise}
          >
            Add Exercise
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecordingForm;
