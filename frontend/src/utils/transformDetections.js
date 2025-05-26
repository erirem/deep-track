export const getFilteredDetections = (history, selectedClass, classMap) => {
  return history.flatMap((item) =>
    item.result
      .filter((r) => ![5, 6, 8].includes(r.class_id))
      .filter((r) => classMap[r.class_id] === selectedClass)
      .map((r) => ({
        filename: item.filename,
        time: item.timestamp,
        confidence: r.confidence,
        source: r.source,
        class_id: r.class_id,
        lat: item.gps?.lat || "",
        lng: item.gps?.lng || "",
        station: item.gps?.station || "-",
      })),
  );
};
