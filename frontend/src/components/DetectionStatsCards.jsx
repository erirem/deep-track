import React from "react";
import {
  FaExclamationTriangle,
  FaBolt,
  FaBug,
  FaWrench,
  FaHeartbeat,
  FaTrain
} from "react-icons/fa";

const icons = {
  "Rail Crack": <FaExclamationTriangle className="text-xl" />,
  "Fastening Defect": <FaWrench className="text-xl" />,
  "Surface Defect": <FaBug className="text-xl" />,
  "Squat": <FaBolt className="text-xl" />,
  "Sleeper Crack": <FaTrain className="text-xl" />,
  "Head Check": <FaHeartbeat className="text-xl" />
};

function DetectionStatsCards({ classStats = {}, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      {Object.entries(classStats).map(([label, count]) => (
        <div
          key={label}
          onClick={() => onSelect(label)}
          className="cursor-pointer bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 transition-transform duration-300 hover:scale-[1.05] shadow-sm rounded-lg px-4 py-3 flex flex-col items-center text-center border border-primary/20"
        >
          <div className="text-primary dark:text-white mb-1">{icons[label] || "❓"}</div>
          <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{label}</p>
          <p className="text-xl font-bold text-primary dark:text-white">{count}</p>
        </div>
      ))}
    </div>
  );
}

export default DetectionStatsCards;
