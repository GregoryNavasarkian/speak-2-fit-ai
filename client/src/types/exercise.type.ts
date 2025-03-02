type Exercise = {
  exercise_name: string;
  type: string;
  sets?: { weight: number; repetitions: number }[];
  time?: number;
};

export default Exercise;
