import { useState, useMemo } from "react";

const ignoreClassIds = [5, 6, 8];

export default function useDetectionTable(history, classMap) {
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [sortKey, setSortKey] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredRows = useMemo(() => {
    return history.flatMap((item, i) =>
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
  }, [history, selectedClassId, classMap]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
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
  }, [filteredRows, sortKey, sortOrder]);

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
      .map((e) => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
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

  return {
    selectedClassId,
    setSelectedClassId,
    sortedRows,
    toggleSort,
    exportToCSV,
  };
}
