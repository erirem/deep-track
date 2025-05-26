import { useEffect, useState, useRef } from "react";

const useLiveDetection = (intervalMs = 10000, lineId = "ankara-istanbul") => {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef();

  useEffect(() => {
    // Hattı değiştirince geçmişi temizle
    setData(null);
    setHistory([]);

    // Yeni interval başlat
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      fetch(`http://localhost:5000/predict-live?lineId=${lineId}`)
        .then((res) => res.json())
        .then((json) => {
          const onlyHealthy = json.result.every((r) =>
            [5, 6, 8].includes(r.class_id)
          );
          const noDetection = json.result.length === 0;
          if (onlyHealthy || noDetection) return;

          setData(json);
          setHistory((prev) => [...prev, json]);
        });
    }, intervalMs);

    return () => clearInterval(intervalRef.current);
  }, [lineId, intervalMs]);

  return { data, history };
};

export default useLiveDetection;
