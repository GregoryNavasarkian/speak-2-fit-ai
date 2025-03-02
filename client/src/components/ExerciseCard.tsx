import React from "react";
import { Card } from "react-bootstrap";
import Exercise from "../types/exercise.type";

const ExerciseCard: React.FC<{ exercise: Exercise }> = ({ exercise }) => {
  return (
    <Card className="mt-3 mb-1 shadow border-0">
      <Card.Body className="text-start">
        <Card.Title className="fw-bold fs-5">
          {exercise.exercise_name}
        </Card.Title>
        <Card.Subtitle className="mb-3 text-muted">
          {exercise.type}
        </Card.Subtitle>

        {/* Weight-lifting details */}
        {exercise.type === "Weight-lifting" && exercise.sets && (
          <div>
            {exercise.sets.map((set, index) => (
              <p key={index} className="mb-1">
                <strong>Set {index + 1}:</strong> {set.weight} lbs ×{" "}
                {set.repetitions} reps
              </p>
            ))}
          </div>
        )}

        {/* Cardio details */}
        {exercise.type === "Cardio" && exercise.time && (
          <p className="mb-0">
            <strong>Duration:</strong> {exercise.time} minutes
          </p>
        )}
      </Card.Body>
    </Card>
  );
};

export default ExerciseCard;
