import React from "react";
import Button from "react-bootstrap/Button";

import TestComp from "./components/TestComp";

const App: React.FC = () => {
  return (
    <>
      <h1>React App</h1>
      <p>Start editing the App component to get started</p>
      <Button variant="primary">Click me</Button>
      <TestComp />
    </>
  );
};

export default App;
