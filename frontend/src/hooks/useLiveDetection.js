import { useEffect, useState, useRef } from "react";

const useLiveDetection = (intervalMs = 10000, lineId = "ankara-istanbul") => {
  const [data, setData] = useState({});
  const [history, setHistory] = useState({});
  const intervalRef = useRef();

  useEffect(() => {
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

          // Güncel veriyi sadece bu hat için ayarla
          setData((prev) => ({
            ...prev,
            [lineId]: json
          }));

          // Geçmişi bu hatta ekle
          setHistory((prev) => ({
            ...prev,
            [lineId]: [...(prev[lineId] || []), json]
          }));
        });
    }, intervalMs);

    return () => clearInterval(intervalRef.current);
  }, [lineId, intervalMs]);

  return { data, history };
};

export default useLiveDetection;
