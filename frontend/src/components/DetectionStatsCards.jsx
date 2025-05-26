import React from "react";

function DetectionStatsCards({ classStats, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      {Object.entries(classStats).map(([label, count]) => (
        <div
          key={label}
          onClick={() => onSelect(label)}
          className="cursor-pointer bg-white dark:bg-gray-800 shadow rounded-lg p-3 flex flex-col items-center justify-center text-center hover:ring-2 ring-primary transition"
        >
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
          <p className="text-2xl font-bold text-primary dark:text-white">{count}</p>
        </div>
      ))}
    </div>
  );
}

export default DetectionStatsCards;
