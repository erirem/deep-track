// App.js
import React, { useEffect, useRef, useState } from "react";
import MapComponent from "./components/MapComponent";

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [sortKey, setSortKey] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
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

          if (onlyHealthy || noDetection) return;

          setData(json);
          setHistory((prev) => [...prev, json]);
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

  const railLine = [
    [39.9208, 32.8541],
    [39.93, 32.75],
    [40.0, 32.4],
    [40.1, 32.0],
    [40.3, 31.5],
    [40.6, 30.5],
    [40.8, 29.8],
    [41.0, 29.2],
    [41.0082, 28.9784],
  ];

  const filteredRows = history.flatMap((item, i) =>
    item.result
      .filter((r) => !ignoreClassIds.includes(r.class_id))
      .filter((r) => selectedClassId === "all" || Number(selectedClassId) === r.class_id)
      .map((r, j) => ({
        key: `${i}-${j}`,
        filename: item.filename,
        timestamp: item.timestamp,
        location: `${item.gps.lat.toFixed(5)}, ${item.gps.lng.toFixed(5)}`,
        class_id: r.class_id,
        defect: classMap[r.class_id],
        source: r.source,
        confidence: r.confidence,
      }))
  );

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (sortKey === "confidence") {
      return sortOrder === "asc"
        ? a.confidence - b.confidence
        : b.confidence - a.confidence;
    } else {
      const valA = a[sortKey].toString();
      const valB = b[sortKey].toString();
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const exportToCSV = () => {
    const headers = ["Filename", "Timestamp", "Location", "Defect Type", "Source", "Confidence"];
    const rows = sortedRows.map((row) => [
      row.filename,
      new Date(row.timestamp).toLocaleString(),
      row.location,
      row.defect,
      row.source,
      row.confidence,
    ]);
    const csvContent = [headers, ...rows]
      .map((e) => e.map(field => `"${String(field).replace(/"/g, '""')}` ).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "defect_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">
        🧠 Deep Track Live Detection
      </h1>

      <div className="w-full max-w-6xl bg-white shadow rounded-lg p-4 mb-6">
        <MapComponent
          railLine={railLine}
          detections={history}
          classMap={classMap}
          classColors={classColors}
        />
      </div>

      {data && (
        <>
          <div className="w-full max-w-4xl bg-white shadow rounded-lg p-4 mb-6">
            <canvas
              ref={canvasRef}
              className="rounded border border-gray-300 max-w-full"
              style={{ maxHeight: "500px" }}
            />
          </div>

          <div className="w-full max-w-4xl bg-white shadow p-4 rounded">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              📋 Tespit Özeti ({data.filename})
            </h2>

            <p className="text-sm text-gray-600 mb-2">
              📍 Koordinat: {data.gps.lat}, {data.gps.lng} <br />
              🦓 Zaman: {new Date(data.timestamp).toLocaleString()}
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
                        {classMap[r.class_id] || `Class ${r.class_id}`} –{" "}
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
        </>
      )}

      {history.length > 0 && (
        <div className="w-full max-w-6xl bg-white shadow rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">🗂 Tespit Geçmişi</h2>

          <div className="mb-4 flex items-center gap-4">
            <div>
              <label className="mr-2 text-sm font-medium text-gray-700">Filtrele:</label>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="all">Tüm Sınıflar</option>
                {Object.entries(classMap)
                  .filter(([id]) => !ignoreClassIds.includes(Number(id)))
                  .map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
              </select>
            </div>

            <button
              onClick={exportToCSV}
              className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
            >
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700 border border-gray-300">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-3 py-2 border cursor-pointer" onClick={() => toggleSort("filename")}>Filename</th>
                  <th className="px-3 py-2 border cursor-pointer" onClick={() => toggleSort("timestamp")}>Timestamp</th>
                  <th className="px-3 py-2 border cursor-pointer" onClick={() => toggleSort("location")}>Location</th>
                  <th className="px-3 py-2 border cursor-pointer" onClick={() => toggleSort("defect")}>Defect Type</th>
                  <th className="px-3 py-2 border cursor-pointer" onClick={() => toggleSort("source")}>Source</th>
                  <th className="px-3 py-2 border cursor-pointer" onClick={() => toggleSort("confidence")}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr key={row.key} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border">{row.filename}</td>
                    <td className="px-3 py-2 border">{new Date(row.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2 border">{row.location}</td>
                    <td className="px-3 py-2 border">{row.defect}</td>
                    <td className="px-3 py-2 border">{row.source}</td>
                    <td className="px-3 py-2 border">{row.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
