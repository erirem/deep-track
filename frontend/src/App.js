import MapComponent from "./components/MapComponent";
import React, { useEffect, useRef, useState } from "react";

function App() {
  const [data, setData] = useState(null);
  const canvasRef = useRef(null);
  const ignoreClassIds = [5, 6, 8];

  const classMap = {
    0: "Head Check",
    1: "Rail Crack",
    2: "Fastening Defect",
    3: "Squat",
    4: "Surface Defect",
    5: "Healthy Sleeper",
    6: "Healthy Fastening",
    7: "Sleeper Crack",
    8: "Healthy Rail",
  };

  const classColors = {
    0: "#3498db",
    1: "#e74c3c",
    2: "#f1c40f",
    3: "#e67e22",
    4: "#9b59b6",
    5: "#2ecc71",
    6: "#1abc9c",
    7: "#d35400",
    8: "#27ae60",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:5000/predict-live")
        .then((res) => res.json())
        .then((json) => {
          const onlyHealthy = json.result.every((r) =>
            ignoreClassIds.includes(r.class_id)
          );

          const noDetection = json.result.length === 0;

          if (onlyHealthy || noDetection) {
            setData(null);
          } else {
            setData(json);
          }
        });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!data || !data.image || !canvasRef.current) return;

    const img = new Image();
    img.src = `data:image/jpeg;base64,${data.image}`;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      data.result
        .filter((r) => !ignoreClassIds.includes(r.class_id))
        .forEach((r) => {
          const [x1, y1, x2, y2] = r.bbox;
          const color = classColors[r.class_id] || "lime";

          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

          ctx.fillStyle = color;
          ctx.font = "16px sans-serif";
          ctx.fillText(
            `${classMap[r.class_id] || "Unknown"} (${r.source})`,
            x1 + 4,
            y1 + 18
          );
        });
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-bold text-indigo-700">
        🧠 Deep Track Live Detection
      </h1>

      {data && data.gps && (
        <div className="w-full max-w-4xl h-96 rounded overflow-hidden shadow">
          <MapComponent gps={data.gps} timestamp={data.timestamp} />
        </div>
      )}

      {data && data.image && (
        <div className="w-full max-w-4xl bg-white shadow rounded-lg p-4">
          <canvas
            ref={canvasRef}
            className="rounded border border-gray-300 max-w-full mx-auto"
            style={{ maxHeight: "500px" }}
          />
        </div>
      )}

      {data && (
        <div className="w-full max-w-4xl bg-white shadow p-4 rounded">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            📋 Tespit Özeti ({data.filename})
          </h2>

          <p className="text-sm text-gray-600 mb-2">
            📍 Koordinat: {data.gps.lat}, {data.gps.lng} <br />
            🕓 Zaman: {new Date(data.timestamp).toLocaleString()}
          </p>

          {data.result.filter((r) => !ignoreClassIds.includes(r.class_id)).length === 0 ? (
            <p className="text-gray-500">Kusur tespit edilmedi.</p>
          ) : (
            <ul className="space-y-3">
              {data.result
                .filter((r) => !ignoreClassIds.includes(r.class_id))
                .map((r, i) => (
                  <li
                    key={i}
                    className="p-3 rounded bg-gray-50 border-l-4"
                    style={{ borderColor: classColors[r.class_id] || "gray" }}
                  >
                    <p className="font-semibold text-gray-800">
                      {classMap[r.class_id] || `Class ${r.class_id}`} – {" "}
                      <span className="text-sm text-gray-600">
                        {r.source} | Güven: {r.confidence}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Konum: [{r.bbox.join(", ")}]
                    </p>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
