import React, { useState } from "react";
import {
  Container,
  Tabs,
  Tab,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { TooltipProps } from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import useExerciseLogs from "../hooks/useExerciseLogs";

type Set = {
  weight: number;
  repetitions: number;
};

type CardioTooltipData = {
  name: string;
  time: number;
  date: string;
};

type WeightTooltipData = {
  name: string;
  averageWeight: number;
  sets?: Set[];
  date: string;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as CardioTooltipData | WeightTooltipData;

    return (
      <div className="bg-white border p-2 rounded shadow-sm small">
        <strong>{data.name}</strong>
        <br />
        <span>Date: {label}</span>
        <br />
        {"time" in data && <span>Time: {data.time} min</span>}
        {"averageWeight" in data && (
          <>
            <span>Avg. Weight: {data.averageWeight} lbs</span>
            <br />
            {Array.isArray((data as WeightTooltipData).sets) && (
              <span>
                Sets:{" "}
                {(data as WeightTooltipData)
                  .sets!.map((s) => `${s.weight}x${s.repetitions}`)
                  .join(", ")}
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  return null;
};

const Insights: React.FC = () => {
  const { exerciseLogs, loading, error } = useExerciseLogs();
  const [selectedType, setSelectedType] = useState<string>("Cardio");
  const [selectedExerciseName, setSelectedExerciseName] =
    useState<string>("All");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Flatten logs for chart use
  const flatData = exerciseLogs.flatMap((log) => {
    const exercises = Array.isArray(log.log) ? log.log : log.log.exercises;
    return exercises.map((ex) => ({
      ...ex,
      date: new Date(log.dateTime),
    }));
  });

  // Get unique exercise names for dropdown
  const uniqueExerciseNames = Array.from(
    new Set(
      flatData
        .filter((e) => e.type === selectedType)
        .map((e) => e.exercise_name),
    ),
  );

  // Filtered data
  const filtered = flatData.filter((ex) => {
    const withinType = ex.type === selectedType;
    const exDate = new Date(ex.date.setHours(0, 0, 0, 0));
    const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
    const end = endDate ? new Date(endDate.setHours(0, 0, 0, 0)) : null;

    const withinDate = (!start || exDate >= start) && (!end || exDate <= end);

    const matchesExercise =
      selectedExerciseName === "All" ||
      ex.exercise_name === selectedExerciseName;

    return withinType && withinDate && matchesExercise;
  });

  // Transform for Recharts
  const cardioData = filtered
    .filter((e) => e.type === "Cardio" && e.time)
    .map((e) => ({
      name: e.exercise_name,
      time: e.time,
      date: e.date.toLocaleDateString(),
    }));

  const weightData = filtered
    .filter((e) => e.type === "Weight-lifting" && e.sets)
    .map((e) => {
      const totalWeight = e.sets!.reduce(
        (sum, s) => sum + s.weight * s.repetitions,
        0,
      );
      const totalReps = e.sets!.reduce((sum, s) => sum + s.repetitions, 0);
      const averageWeight = totalReps > 0 ? totalWeight / totalReps : 0;

      return {
        name: e.exercise_name,
        averageWeight: Number(averageWeight.toFixed(2)),
        sets: e.sets,
        date: e.date.toLocaleDateString(),
      };
    });

  const chartData = selectedType === "Cardio" ? cardioData : weightData;

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Insights</h2>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filters */}
      <Row className="mb-3">
        <Col sm={3}>
          <Form.Group>
            <Form.Label>Exercise Type</Form.Label>
            <Form.Select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setSelectedExerciseName("All");
              }}
            >
              <option value="Cardio">Cardio</option>
              <option value="Weight-lifting">Weight-lifting</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col sm={3}>
          <Form.Group>
            <Form.Label>Exercise Name</Form.Label>
            <Form.Select
              value={selectedExerciseName}
              onChange={(e) => setSelectedExerciseName(e.target.value)}
            >
              <option value="All">All Exercises</option>
              {uniqueExerciseNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col sm={3}>
          <div className="mb-3">
            <Form.Label className="d-block">Start Date</Form.Label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Start Date"
              className="form-control"
            />
          </div>
        </Col>

        <Col sm={3}>
          <div className="mb-3">
            <Form.Label className="d-block">End Date</Form.Label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="End Date"
              className="form-control"
            />
          </div>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs defaultActiveKey="bar" id="insights-tabs" className="mb-3">
        <Tab eventKey="bar" title="Bar Chart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                label={{ value: "Date", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{
                  value:
                    selectedType === "Cardio"
                      ? "Time (min)"
                      : "Avg Weight (lbs)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={selectedType === "Cardio" ? "time" : "averageWeight"}
                fill="#61ac85"
              />
            </BarChart>
          </ResponsiveContainer>
        </Tab>

        <Tab eventKey="line" title="Line Chart">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                label={{ value: "Date", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{
                  value:
                    selectedType === "Cardio"
                      ? "Time (min)"
                      : "Avg Weight (lbs)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={selectedType === "Cardio" ? "time" : "averageWeight"}
                stroke="#61ac85"
              />
            </LineChart>
          </ResponsiveContainer>
        </Tab>

        <Tab eventKey="table" title="Table View">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Exercise</th>
                <th>Type</th>
                <th>
                  {selectedType === "Cardio"
                    ? "Time (min)"
                    : "Avg. Weight (lbs)"}
                </th>
                {selectedType === "Weight-lifting" && (
                  <th>Sets (weight x reps)</th>
                )}
              </tr>
            </thead>
            <tbody>
              {chartData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.date}</td>
                  <td>{entry.name}</td>
                  <td>{selectedType}</td>
                  <td>
                    {"time" in entry
                      ? entry.time
                      : "averageWeight" in entry
                        ? entry.averageWeight
                        : "-"}
                  </td>
                  {selectedType === "Weight-lifting" && (
                    <td>
                      {"sets" in entry && Array.isArray(entry.sets)
                        ? entry.sets
                          .map((s) => `${s.weight}x${s.repetitions}`)
                          .join(", ")
                        : "-"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Insights;
