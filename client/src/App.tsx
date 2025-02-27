import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainNavbar from "./components/MainNavbar";
import HomeRoute from "./routes/HomeRoute";
import ExercisesRoute from "./routes/ExercisesRoute";
import InsightRoute from "./routes/InsightRoute";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainNavbar />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/exercises" element={<ExercisesRoute />} />
        <Route path="/insights" element={<InsightRoute />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
