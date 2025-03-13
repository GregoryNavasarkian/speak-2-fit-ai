import React, { useState } from "react";
import { Container, Button, Collapse, Card } from "react-bootstrap";
import RecordingForm from "../components/RecordingForm";

const HomeRoute: React.FC = () => {
  const [showHelp, setShowHelp] = useState<boolean>(false);

  return (
    <Container fluid className="d-flex flex-column min-vh-100 text-center">
      <div className="flex-grow-1 d-flex flex-column align-items-center mt-5 mt-md-5 p-5">
        <h1 style={{ color: "#61ac85" }} className="mb-2 w-100">
          Speak2Fit AI
        </h1>

        {/* Help Text Button */}
        <Button
          variant="link"
          className="text-decoration-none"
          onClick={() => setShowHelp(!showHelp)}
          aria-controls="help-section"
          aria-expanded={showHelp}
          style={{ color: "#61ac85" }}
        >
          Need help? Click here for examples
        </Button>

        {/* Expandable Help Section */}
        <div
          id="help-section"
          className="d-flex justify-content-center"
          style={{ width: "100%" }}
        >
          <Collapse in={showHelp}>
            <Card
              className="text-start p-2 mt-1 shadow-sm"
              style={{ width: "95%", maxWidth: "500px" }}
            >
              <Card.Body>
                <Card.Title className="fw-bold">Example Submissions</Card.Title>
                <Card.Text className="m-1">
                  <strong>Weight-lifting:</strong> "Bench press, 5 sets, 7 reps,
                  200 lbs."
                </Card.Text>
                <Card.Text className="m-1">
                  <strong>Cardio:</strong> "Cycling for 45 minutes."
                </Card.Text>
              </Card.Body>
            </Card>
          </Collapse>
        </div>

        {/* Form Container */}
        <div className="p-1" style={{ width: "95%", maxWidth: "600px" }}>
          <RecordingForm />
        </div>
      </div>
    </Container>
  );
};

export default HomeRoute;
