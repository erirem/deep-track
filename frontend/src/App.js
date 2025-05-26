import React, { useState, useEffect } from "react";
import useLiveDetection from "./hooks/useLiveDetection";
import { useDetectionStats } from "./hooks/useDetectionStats";
import { getFilteredDetections } from "./utils/transformDetections";
import { exportDetectionsToCSV } from "./utils/exportToCSV";
import { classMap, classColors, severityLevels } from "./constants/detectionConfig";
import { HAT_CONFIG } from "./constants/hatConfig";

import MapComponent from "./components/MapComponent";
import DetectionCanvas from "./components/DetectionCanvas";
import DetectionStatsCards from "./components/DetectionStatsCards";
import FilteredList from "./components/FilteredList";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedLine, setSelectedLine] = useState("ankara-istanbul");

const { data, history } = useLiveDetection(10000, selectedLine);
const currentLineData = data[selectedLine] || null;
const currentLineHistory = history[selectedLine] || [];

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const { totalDetections, classStats } = useDetectionStats(currentLineHistory, classMap);

  const filteredDetections = selectedClass
    ? getFilteredDetections(currentLineHistory, selectedClass, classMap)
    : [];

  const handleCSVExport = () => {
    const source = selectedClass
      ? filteredDetections.map(r => ({
          ...r,
          className: classMap[r.class_id] || r.class_id
        }))
      : currentLineHistory.flatMap(item =>
          item.result
            .filter(r => ![5, 6, 8].includes(r.class_id))
            .map(r => ({
              className: classMap[r.class_id] || r.class_id,
              filename: item.filename,
              source: r.source,
              confidence: r.confidence,
              time: item.timestamp,
              lat: item.gps?.lat || "",
              lng: item.gps?.lng || "",
              station: item.gps?.station || "-",
            }))
        );

    exportDetectionsToCSV(
      source,
      selectedClass ? `${selectedClass}_tespitleri.csv` : "tum_tespitler.csv"
    );
  };

  const railLine = HAT_CONFIG[selectedLine].stations.map(st => [st.lat, st.lng]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Üst başlık ve dark mode */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-heading font-bold text-primary dark:text-white flex-1 text-center">
          Deep Track Live Detection
        </h1>
        <button
          onClick={() => setDarkMode(prev => !prev)}
          className="ml-4 text-sm bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-3 py-1 rounded"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Hat seçici dropdown */}
      <div className="mb-4 flex items-center gap-2 justify-center">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Hat Seç:
        </label>
        <select
          value={selectedLine}
          onChange={(e) => {
            setSelectedLine(e.target.value);
            setSelectedClass(null);
          }}
          className="text-sm border px-2 py-1 rounded dark:bg-gray-800 dark:text-white"
        >
          {Object.entries(HAT_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>
              {val.name}
            </option>
          ))}
        </select>
      </div>

      {/* Toplam sayılar ve sınıf kartları */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-4 text-center">
        <p className="text-lg font-bold text-primary dark:text-white">
          Toplam Tespit Sayısı: {totalDetections}
        </p>
      </div>

      <DetectionStatsCards classStats={classStats} onSelect={setSelectedClass} />

      {selectedClass && (
        <FilteredList
          selectedClass={selectedClass}
          detections={filteredDetections}
          onClose={() => setSelectedClass(null)}
          onExport={handleCSVExport}
        />
      )}

      {/* Harita ve canvas bölgesi */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <MapComponent
            railLine={railLine}
            detections={currentLineHistory}
            classMap={classMap}
            classColors={classColors}
            selectedClassId={
              selectedClass
                ? Number(Object.keys(classMap).find(k => classMap[k] === selectedClass))
                : null
            }
          />

          {currentLineData && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <h2 className="text-xl font-heading text-primary dark:text-white font-bold mb-3">
              Tespit Özeti ({currentLineData.filename})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Koordinat: {currentLineData.gps.lat}, {currentLineData.gps.lng} <br />
              Durak: {currentLineData.gps.station} <br />
              Zaman: {new Date(currentLineData.timestamp).toLocaleString()}
            </p>

            <div className="space-y-2">
              {currentLineData.result
                .filter(r => ![5, 6, 8].includes(r.class_id))
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

        {/* Sağ: Canvas */}
        <div className="space-y-6 flex flex-col justify-between">
          {currentLineData && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex justify-center items-center">
            <div className="max-w-[320px] w-full">
              <DetectionCanvas
                image={currentLineData.image}
                result={currentLineData.result}
                classMap={classMap}
                classColors={classColors}
              />
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default App;
