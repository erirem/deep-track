import React from "react";
import useDetectionTable from "../hooks/useDetectionTable";

function DetectionTable({ history, classMap }) {
  const {
    selectedClassId,
    setSelectedClassId,
    sortedRows,
    toggleSort,
    exportToCSV,
  } = useDetectionTable(history, classMap);

  const visibleClassOptions = Object.entries(classMap).filter(
    ([id]) => ![5, 6, 8].includes(Number(id))
  );

  return (
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
            {visibleClassOptions.map(([id, name]) => (
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
              {["filename", "timestamp", "location", "defect", "source", "confidence"].map((key) => (
                <th
                  key={key}
                  className="px-3 py-2 border cursor-pointer"
                  onClick={() => toggleSort(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </th>
              ))}
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
  );
}

export default DetectionTable;
