import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

interface Row {
  id: number;
  activity: string;
  details: string[];
}

interface ExerciseCardProps {
  log: {
    id: number;
    date: Date;
    rows: Row[];
  };
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ log }) => {
  const [rows, setRowData] = useState<Row[]>(log.rows);
  const [cardDate, setCardDate] = useState<Date>(new Date("2025-02-26"));
  const [isEditingRowId, setIsEditingRowId] = useState<number | null>(null);
  const [newDetailInputs, setNewDetailInputs] = useState<Record<number, string[]>>({});
  const [isEditingDate, setIsEditingDate] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isAddingRow, setIsAddingRow] = useState<boolean>(false);
  const [isCardVisible, setIsCardVisible] = useState<boolean>(true);

  const addRow = (): void => {
    const newRowId = Date.now();
    setRowData([...rows, { id: newRowId, activity: "", details: [] }]);
    setIsEditingRowId(newRowId);
    setNewDetailInputs({ ...newDetailInputs, [newRowId]: [] });
    setIsAddingRow(true);
  };

  const addDetailInput = (rowId: number): void => {
    setNewDetailInputs({
      ...newDetailInputs,
      [rowId]: [...(newDetailInputs[rowId] || []), ""],
    });
  };

  const handleEditRow = (id: number): void => {
    setIsEditingRowId(id);
    if (!newDetailInputs[id]) {
      setNewDetailInputs({ ...newDetailInputs, [id]: [] });
    }
    setIsAddingRow(false);
  };

  const saveEditRow = (id: number): void => {
    const rowToSave = rows.find((row) => row.id === id);
    if (!rowToSave) return;

    if (!rowToSave.details.every((detail) => detail.trim() !== "")) {
      showToastMessage("All existing detail fields must be filled.");
      return;
    }
    if (!rowToSave.activity.trim()) {
      showToastMessage("Activity field cannot be empty.");
      return;
    }

    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          details: [
            ...row.details,
            ...(newDetailInputs[id] || []).filter((detail) => detail.trim() !== ""),
          ],
        };
      }
      return row;
    });

    if (isAddingRow) {
      showToastMessage("Exercise added successfully!");
    } else {
      showToastMessage("Exercise edited successfully!");
    }
    setRowData(updatedRows);
    setIsEditingRowId(null);
    setNewDetailInputs({ ...newDetailInputs, [id]: [] });
    setIsAddingRow(false);

    //Call API to save the edited exercise
  };

  const showToastMessage = (message: string): void => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const updateActivityOrDetail = (rowId: number, value: string, field: string, index: number | null = null): void => {
    const updatedRows = rows.map((row) => {
      if (row.id === rowId) {
        if (field === "activity") {
          return { ...row, activity: value };
        } else if (field === "details" && index !== null) {
          const updatedDetails = [...row.details];
          updatedDetails[index] = value;
          return { ...row, details: updatedDetails };
        }
      }
      return row;
    });
    setRowData(updatedRows);
  };

  const updateNewDetailInput = (rowId: number, index: number, value: string): void => {
    setNewDetailInputs({
      ...newDetailInputs,
      [rowId]: newDetailInputs[rowId].map((inputValue, i) =>
        i === index ? value : inputValue
      ),
    });
  };

  const deleteRow = (id: number): void => {
    setRowData(rows.filter((row) => row.id !== id));
    showToastMessage("Exercise deleted successfully!");

    //Call API to save the edited exercise
  };

  const deleteCard = (): void => {
    setIsCardVisible(false);
    showToastMessage("Exercise Log deleted successfully!");

    //Call API to delete the exercise
  };

  return (
    <>
      {showToast && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <div className="toast show bg-success text-white" role="alert">
            <div className="toast-body">{toastMessage}</div>
          </div>
        </div>
      )}
      {isCardVisible && (
        <div className="card m-3" style={{ width: "22rem" }}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              {isEditingDate ? (
                <DatePicker
                  selected={cardDate}
                  onChange={(date: Date | null) => {
                    if (date) {
                         setCardDate(date);
                         setIsEditingDate(false);
                         showToastMessage("Log date edited successfully!");
                     }
                  }}
                  className="form-control"
                />
              ) : (
                <h5 className="mb-0">{cardDate.toLocaleDateString()}</h5>
              )}
            </div>
            <div>
              <button className="btn btn-sm" style={{marginLeft: "-12%"}} onClick={() => setIsEditingDate(true)}>
                <i className="bi bi-pencil-square"></i>
              </button>
              <button className="btn btn-sm" style={{marginLeft: "12%"}} onClick={deleteCard}>
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div className="card-body">
            {rows.map((row) => (
              <div key={row.id} className="mb-3">
                <div className="d-flex align-items-center">
                  {isEditingRowId === row.id ? (
                    <input
                      type="text"
                      value={row.activity}
                      onChange={(e) => updateActivityOrDetail(row.id, e.target.value, "activity")}
                      placeholder="Activity"
                      className="form-control form-control-sm me-2 w-50"
                    />
                  ) : (
                    <span className="w-50">{row.activity}</span>
                  )}
                  {isEditingRowId === row.id ? (
                    <>
                      <input
                        type="text"
                        value={row.details[0]}
                        onChange={(e) =>
                          updateActivityOrDetail(row.id, e.target.value, "details", 0)
                        }
                        placeholder="Details"
                        className="form-control form-control-sm me-2 w-25"
                      />
                    </>
                  ) : (
                    <>
                      <span className="w-25">{row.details[0]}</span>
                    </>
                  )}
                  <div style={{ marginLeft: "20px"}}>
                    {isEditingRowId === row.id ? (
                      <button
                        className="btn btn-sm"
                        onClick={() => saveEditRow(row.id)}
                      >
                        <i className="bi bi-check-square"></i>
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm me-1"
                        onClick={() => handleEditRow(row.id)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                    )}
                  </div>
                  <button className="btn btn-sm ms-1" onClick={() => deleteRow(row.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
                {row.details.slice(1).map((detail, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mt-2">
                    {isEditingRowId === row.id ? (
                      <>
                        <input
                          type="text"
                          value={detail}
                          onChange={(e) =>
                            updateActivityOrDetail(row.id, e.target.value, "details", index + 1)
                          }
                          style={{marginRight: "30.5%", width: "22%" }}
                          placeholder={`Detail`}
                          className="form-control form-control-sm ms-auto"
                        />
                      </>
                    ) : (
                      <>
                        <span className="ms-auto" style={{marginRight: "30.5%", width: "22%" }}>{detail}</span>
                      </>
                    )}
                  </div>
                ))}
                {isEditingRowId === row.id &&
                  (newDetailInputs[row.id] || []).map((inputValue, index) => (
                    <div key={index} className="d-flex align-items-center mt-2 ms-auto" style={{ marginRight: "30.5%", width: "22%" }}>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) =>
                          updateNewDetailInput(row.id, index, e.target.value)
                        }
                        placeholder={`Detail`}
                        className="form-control form-control-sm"
                      />
                    </div>
                  ))}
                {isEditingRowId === row.id && (
                  <>
                    <div style={{ marginLeft: "45%"}}>
                      <button
                        className="btn btn-sm"
                        onClick={() => addDetailInput(row.id)}
                      >
                        <i className="bi bi-plus-square"></i>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            <div className="d-flex justify-content-start" style={{marginLeft: "-15px"}}>
              <button className="btn btn-lg" onClick={addRow}>
                <i className="bi bi-plus-square"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExerciseCard;