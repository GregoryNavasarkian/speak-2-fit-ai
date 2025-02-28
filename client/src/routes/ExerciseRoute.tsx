import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CardComponent from "../components/CardComponent";

interface Log {
  id: number;
  date: Date;
  rows: { id: number; activity: string; details: string[] }[];
}

const ExerciseRoute: React.FC = () => {
  const [pendingLogs, setPendingLogs] = useState<Log[]>([
    {
      id: 1,
      date: new Date("2025-02-18"),
      rows: [
        { id: 1, activity: "Bicep Curl", details: ["3 x 10"] },
        { id: 2, activity: "In-door Running", details: ["30 mins"] },
      ],
    },
  ]);

  const [logs, setLogs] = useState<Log[]>([
    {
      id: 1,
      date: new Date("2025-02-18"),
      rows: [
        { id: 1, activity: "Bicep Curl", details: ["3 x 10"] },
        { id: 2, activity: "In-door Running", details: ["30 mins"] },
      ],
    },
  ]);

  // Handle Save Button Click
  const handleSave = (log: Log) => {
    // setLogs((prevLogs) => [...prevLogs, log]);
    // setPendingLogs((prevPendingLogs) => prevPendingLogs.filter((pendingLog) => pendingLog.id !== log.id));
  };

  // Delete a pending log
  const deletePendingLog = (logId: number) => {
    setPendingLogs((prevPendingLogs) => prevPendingLogs.filter((log) => log.id !== logId));
  };

  // Delete a completed log
  const deleteLog = (logId: number) => {
    setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));
  };

  return (
    <>
      <div className="container-fluid mt-4">
        <div className="row">
          {/* Pending Logs Section */}
          <div className="col-12 mb-4">
            <h5 className="text-success">Pending Logs</h5>
            <div className="row">
              {pendingLogs.length > 0 ? (
                pendingLogs.map((log) => (
                  <div className="col-md-4" key={log.id}>
                    <CardComponent
                      key={log.id}
                      onSave={() => handleSave(log)}
                      onDelete={() => deletePendingLog(log.id)}
                      showSaveButton={true}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-person-running display-4"></i>
                  <img src="../assets/no_exercise_log.png" style={{width: "200px", height: "200px"}}/>
                  <p>No pending exercise log</p>
                </div>
              )}
            </div>
          </div>

          {/* Logs Section */}
          <div className="col-12">
            <h5 className="text-success">Logs</h5>
            <div className="row">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div className="col-md-4" key={log.id}>
                    <CardComponent
                      key={log.id}
                      onDelete={() => deleteLog(log.id)}
                      showSaveButton={false}
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
      </div>
    </>
  );
};

export default ExerciseRoute;
