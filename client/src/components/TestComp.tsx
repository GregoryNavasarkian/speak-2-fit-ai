import React, { useState, useEffect } from "react";

const TestComp: React.FC = () => {
  const [data, setData] = useState<string>("");
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("/api/test");
        const data = await response.json();
        setData(data.message);
      } catch (error) {
        console.error(error);
      }
    };
    getData();
  }, [data]);

  return <div>Test Data From Server: {data}</div>;
};

export default TestComp;
