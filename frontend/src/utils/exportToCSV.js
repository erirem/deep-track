export const exportDetectionsToCSV = (rows, filename = "tespitler.csv") => {
  const headers = ["Class", "Filename", "Model", "Confidence", "Timestamp", "Latitude", "Longitude", "Station"];

  const csvContent = [
    headers,
    ...rows.map(row => [
      row.className,
      row.filename,
      row.source,
      row.confidence,
      new Date(row.time).toLocaleString(),
      row.lat,
      row.lng,
      row.station,
    ])
  ]
    .map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
