import React from "react";
import {
  ClipboardDocumentListIcon,
  MapPinIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentTextIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

function FilteredList({ selectedClass, detections, onClose, onExport }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      {/* Başlık */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-primary dark:text-white">
          <ClipboardDocumentListIcon className="w-5 h-5" />
          {selectedClass} tespit geçmişi ({detections.length})
        </h2>

        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            CSV İndir
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <XMarkIcon className="w-4 h-4" />
            Kapat
          </button>
        </div>
      </div>

      {/* Liste */}
      {detections.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Henüz bu sınıfa ait tespit bulunamadı.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {detections.map((det, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-600 space-y-1 text-sm transition-transform hover:scale-[1.01] duration-300"
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-white font-medium">
                <DocumentTextIcon className="w-4 h-4" />
                {det.filename}
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300">
                <CpuChipIcon className="w-4 h-4" />
                {det.source} | Güven: {det.confidence}
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300">
                <ClockIcon className="w-4 h-4" />
                {new Date(det.time).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300">
                <MapPinIcon className="w-4 h-4" />
                {det.lat}, {det.lng}
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300">
                <BuildingOfficeIcon className="w-4 h-4" />
                {det.station || "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilteredList;
