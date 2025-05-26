import React from "react";
import {
  ClipboardDocumentCheckIcon,
  MapPinIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentTextIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";

function FilteredList({ selectedClass, detections, onClose, onExport}) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 mt-2">
      <div className="flex justify-between items-center mb-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-primary dark:text-white">
          <ClipboardDocumentCheckIcon className="w-5 h-5" />
          {selectedClass} Tespit Geçmişi ({detections.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="text-sm px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            <ArrowDownTrayIcon className="w-4 h-4 inline-block mr-1" />
            CSV İndir
          </button>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
          >
            <XMarkIcon className="w-4 h-4 inline-block mr-1" />
            Kapat
          </button>
        </div>
      </div>
      <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300 max-h-64 overflow-auto">
        {detections.map((det, i) => (
          <li key={i} className="border-b py-2">
            <p className="flex items-center gap-1">
              <DocumentTextIcon className="w-4 h-4" />
              <span className="font-semibold">Dosya:</span> {det.filename}
            </p>
            <p className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span className="font-semibold">Zaman:</span> {new Date(det.time).toLocaleString()}
            </p>
            <p className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              <span className="font-semibold">Koordinat:</span> {det.lat}, {det.lng}
            </p>
            <p className="flex items-center gap-1">
              <BuildingOfficeIcon className="w-4 h-4" />
              <span className="font-semibold">Durak:</span> {det.station}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FilteredList;
