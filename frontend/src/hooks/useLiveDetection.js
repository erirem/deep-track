import { useEffect, useState } from "react";

const IGNORE_CLASS_IDS = [5, 6, 8];

export default function useLiveDetection(pollingInterval = 10000) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:5000/predict-live")
        .then((res) => res.json())
        .then((json) => {
          const onlyHealthy = json.result.every((r) =>
            IGNORE_CLASS_IDS.includes(r.class_id)
          );
          const noDetection = json.result.length === 0;

          if (onlyHealthy || noDetection) return;

          setData(json);
          setHistory((prev) => [...prev, json]);
        });
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval]);

  return { data, history };
}
