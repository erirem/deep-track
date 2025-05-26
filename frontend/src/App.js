import React, { useState, useEffect } from "react";
import useLiveDetection from "./hooks/useLiveDetection";
import { useDetectionStats } from "./hooks/useDetectionStats";
import { getFilteredDetections } from "./utils/transformDetections";
import { exportDetectionsToCSV } from "./utils/exportToCSV";
import { classMap, classColors, severityLevels } from "./constants/detectionConfig";
import { HAT_CONFIG } from "./constants/hatConfig";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ClockIcon,
  DocumentTextIcon,
  ShieldExclamationIcon
} from "@heroicons/react/24/outline";

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 font-sans text-gray-800 dark:text-gray-100 animate-fade-in transition-colors duration-300">
    <div className="flex flex-col items-center justify-center mb-6 relative">
      <button
        onClick={() => setDarkMode((prev) => !prev)}
        className="absolute right-0 top-0 text-sm px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow transition-colors duration-200"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="flex items-center justify-center gap-3 text-4xl font-heading font-bold text-primary dark:text-white mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-indigo-600 dark:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
      <span>Deep Track</span>
    </div>


      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl px-5 py-3 flex items-center gap-3 hover:shadow-lg hover:ring-1 hover:ring-primary/40 transition-all duration-300">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
            Hat Seç:
          </label>
          <select
            value={selectedLine}
            onChange={(e) => {
              setSelectedLine(e.target.value);
              setSelectedClass(null);
            }}
            className="text-sm border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
          >
            {Object.entries(HAT_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>
                {val.name}
              </option>
            ))}
          </select>
        </div>
    </div>

      <div className="bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-lg font-medium tracking-wide">Toplam Tespit Sayısı</p>
            <p className="text-3xl font-bold mt-1">{totalDetections}</p>
          </div>
          <ChartBarIcon className="w-12 h-12 opacity-20" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
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
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <DocumentTextIcon className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-heading font-bold text-primary dark:text-white">
                    Tespit Özeti – {currentLineData.filename}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-primary" />
                    <span>
                      Koordinat: {currentLineData.gps.lat}, {currentLineData.gps.lng}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="w-4 h-4 text-primary" />
                    <span>Durak: {currentLineData.gps.station}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <ClockIcon className="w-4 h-4 text-primary" />
                    <span>Zaman: {new Date(currentLineData.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
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
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {classMap[r.class_id]}
                            </p>
                            <p className="text-gray-500 dark:text-gray-300 text-xs">
                              {r.source} | Güven: {r.confidence}
                            </p>
                          </div>

                          {severity && (
                            <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${severity.color}`}>
                              <ShieldExclamationIcon className="w-4 h-4" />
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
          {currentLineHistory.length === 0 && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center text-gray-500 dark:text-gray-300 flex flex-col items-center justify-center gap-3">
                <MagnifyingGlassIcon className="w-10 h-10 text-primary opacity-60" />
                <p className="italic text-sm">Bu hatta henüz tespit edilen bir kusur bulunmamaktadır.</p>
              </div>
          )}

          <div className="w-full h-full">
            {currentLineData && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex justify-center items-center">
                <div className="max-w-[360px] w-full">
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
