import mongoose, { Schema, Document } from "mongoose";

interface IExerciseLog extends Document {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: any;
  dateTime: Date;
}

const ExerciseLogSchema = new Schema<IExerciseLog>({
  log: { type: Schema.Types.Mixed, required: true }, // Allow dynamic objects
  dateTime: { type: Date, default: Date.now }
});

const ExerciseLog = mongoose.model<IExerciseLog>("ExerciseLog", ExerciseLogSchema);

export default ExerciseLog;
