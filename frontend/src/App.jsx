import React, { useEffect, useState } from "react";

function App() {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:8000/stream")
        .then(res => res.blob())
        .then(blob => {
          setImageSrc(URL.createObjectURL(blob));
        });
    }, 3000); // 3 saniyede bir yeni "kamera karesi"

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Deepsense Real-Time Simulation</h1>
      {imageSrc && (
        <img src={imageSrc} alt="Real-time camera frame" className="w-[300px] rounded shadow" />
      )}
      {/* Buraya tahmin sonucu da eklenebilir */}
    </div>
  );
}

export default App;
