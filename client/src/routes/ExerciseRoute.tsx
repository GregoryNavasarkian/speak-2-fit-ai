import React, { useState } from "react";
import ExerciseCard from "../components/ExerciseCard";

interface Row {
  id: number;
  activity: string;
  details: string[];
}

interface Log {
  id: number;
  date: Date;
  rows: Row[];
}

const ExerciseRoute: React.FC = () => {
  const [logs] = useState<Log[]>([
    //Get data from the API to retrieve the logs stored in the database
    {
      id: 1,
      date: new Date("2025-02-18"),
      rows: [
        { id: 1, activity: "Bicep Curl", details: ["3 x 10"] },
        { id: 2, activity: "In-door Running", details: ["30 mins"] },
      ],
    },
  ]);

  return (
    <>
      <div className="container-fluid mt-4">
        <div className="col-12">
          <h5 className="text-success">Logs</h5>
          <div className="row">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div className="col-md-4" key={log.id}>
                  <ExerciseCard
                    log={log}
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-muted">
                <i className="bi bi-person-running display-4"></i>
                <img src="../assets/no_exercise_log.png" style={{width: "200px", height: "200px"}}/>
                <p>No exercise log yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExerciseRoute;