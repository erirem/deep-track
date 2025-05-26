export const useDetectionStats = (history, classMap) => {
  const totalDetections = history.reduce(
    (acc, item) => acc + item.result.filter(r => ![5, 6, 8].includes(r.class_id)).length,
    0
  );

  const classStats = {};
  history.forEach(item => {
    item.result
      .filter(r => ![5, 6, 8].includes(r.class_id))
      .forEach(r => {
        const label = classMap[r.class_id] || `Class ${r.class_id}`;
        classStats[label] = (classStats[label] || 0) + 1;
      });
  });

  return { totalDetections, classStats };
};
