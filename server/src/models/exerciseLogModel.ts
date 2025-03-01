const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Since the exercise log object is dynamic, the log will be of mixed type
const ExerciseLogModel = new Schema({
  log: {},
  dateTime: { type: Date, default: Date.now }
});

const ExerciseLog = mongoose.model("exercise-log", ExerciseLogModel);
export default ExerciseLog;
