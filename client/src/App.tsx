import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainNavbar from "./components/MainNavbar";
import HomeRoute from "./routes/HomeRoute";
import ExerciseRoute from "./routes/ExerciseRoute";
import InsightRoute from "./routes/InsightRoute";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainNavbar />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/exercise" element={<ExerciseRoute />} />
        <Route path="/insights" element={<InsightRoute />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
