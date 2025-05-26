import React, { useState, useEffect } from "react";
import useLiveDetection from "./hooks/useLiveDetection";
import MapComponent from "./components/MapComponent";
import DetectionCanvas from "./components/DetectionCanvas";
import DetectionTable from "./components/DetectionTable";

function App() {
  const { data, history } = useLiveDetection(10000);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showHistory ? "hidden" : "auto";
  }, [showHistory]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark");
    if (darkMode) {
      html.classList.add("dark");
    }
  }, [darkMode]);

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

  const severityLevels = {
    1: { label: "Seviye 4 – Kritik", color: "bg-red-600 text-white" },
    0: { label: "Seviye 3 – Orta", color: "bg-orange-500 text-white" },
    3: { label: "Seviye 3 – Orta", color: "bg-orange-500 text-white" },
    2: { label: "Seviye 2 – Düşük", color: "bg-yellow-400 text-black" },
    4: { label: "Seviye 2 – Düşük", color: "bg-yellow-400 text-black" },
    7: { label: "Seviye 1 – Çok Düşük", color: "bg-green-500 text-white" },
  };

  const totalDetections = history.reduce(
    (acc, item) => acc + item.result.filter(r => ![5, 6, 8].includes(r.class_id)).length,
    0
  );

  // ✅ Sınıf bazlı toplamlar
  const classStats = {};
  history.forEach(item => {
    item.result
      .filter(r => ![5, 6, 8].includes(r.class_id))
      .forEach(r => {
        const label = classMap[r.class_id] || `Class ${r.class_id}`;
        classStats[label] = (classStats[label] || 0) + 1;
      });
  });

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Başlık */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-heading font-bold text-primary dark:text-white flex-1 text-center">
          🧠 Deep Track Live Detection
        </h1>
        <button
          onClick={() => setDarkMode(prev => !prev)}
          className="ml-4 text-sm bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-3 py-1 rounded"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Toplam tespit sayısı */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-4 text-center">
        <p className="text-lg font-bold text-primary dark:text-white">
          🛠️ Toplam Tespit Sayısı: {totalDetections}
        </p>
      </div>

      {/* Kutucuklar halinde sınıf dağılımı */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {Object.entries(classStats).map(([label, count]) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-3 flex flex-col items-center justify-center text-center"
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
            <p className="text-2xl font-bold text-primary dark:text-white">{count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sol */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 h-[400px] overflow-hidden z-10 relative">
            <MapComponent
              railLine={railLine}
              detections={history}
              classMap={classMap}
              classColors={classColors}
            />
          </div>

          {data && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <h2 className="text-xl font-heading text-primary dark:text-white font-bold mb-3">
                📋 Tespit Özeti ({data.filename})
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                📍 Koordinat: {data.gps.lat}, {data.gps.lng} <br />
                🕒 Zaman: {new Date(data.timestamp).toLocaleString()}
              </p>

              <div className="space-y-2">
                {data.result
                  .filter((r) => ![5, 6, 8].includes(r.class_id))
                  .map((r, i) => {
                    const severity = severityLevels[r.class_id];
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center border-l-4 p-3 bg-white dark:bg-gray-700 rounded shadow-sm text-sm"
                        style={{ borderColor: classColors[r.class_id] || "#999" }}
                      >
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-white">
                            {classMap[r.class_id]}
                          </span>
                          <span className="text-gray-500 dark:text-gray-300 ml-1">
                            – {r.source} | Güven: {r.confidence}
                          </span>
                        </div>

                        {severity && (
                          <span className={`ml-3 px-2 py-1 text-xs rounded ${severity.color}`}>
                            {severity.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Sağ */}
        <div className="space-y-6 flex flex-col justify-between">
          {data && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex justify-center items-center">
              <div className="max-w-[320px] w-full">
                <DetectionCanvas
                  image={data.image}
                  result={data.result}
                  classMap={classMap}
                  classColors={classColors}
                />
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => setShowHistory(true)}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              📄 Tespit Geçmişini Görüntüle
            </button>
          </div>
        </div>
      </div>

      {/* Geçmiş Paneli */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-40 transition-opacity duration-300 ${
          showHistory ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-[800px] bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ${
            showHistory ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="relative h-full p-6 overflow-auto">
            <button
              onClick={() => setShowHistory(false)}
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white text-xl"
            >
              &times;
            </button>
            <DetectionTable history={history} classMap={classMap} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
