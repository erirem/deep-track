import React, { useEffect, useRef } from "react";

const ignoreClassIds = [5, 6, 8];

function DetectionCanvas({ image, result, classMap, classColors }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const img = new Image();
    img.src = `data:image/jpeg;base64,${image}`;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      result
        .filter((r) => !ignoreClassIds.includes(r.class_id))
        .forEach((r) => {
          const [x1, y1, x2, y2] = r.bbox;
          const color = classColors[r.class_id] || "lime";

          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

          ctx.fillStyle = color;
          ctx.font = "16px sans-serif";
          ctx.fillText(
            `${classMap[r.class_id] || "Unknown"} (${r.source})`,
            x1 + 4,
            y1 + 18
          );
        });
    };
  }, [image, result, classMap, classColors]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded border border-gray-300 max-w-full"
      style={{ maxHeight: "500px" }}
    />
  );
}

export default DetectionCanvas;
