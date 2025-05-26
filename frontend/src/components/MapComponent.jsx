import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Risk seviyelerine göre renklendirme
const severityConfig = {
  1: { color: "#e74c3c", level: "Seviye 4 - Kritik Risk" },
  0: { color: "#e67e22", level: "Seviye 3 - Orta-Üst Risk" },
  3: { color: "#e67e22", level: "Seviye 3 - Orta-Üst Risk" },
  4: { color: "#f1c40f", level: "Seviye 2 - Orta Risk" },
  2: { color: "#f1c40f", level: "Seviye 2 - Orta Risk" },
  7: { color: "#2ecc71", level: "Seviye 1 - Düşük Risk" },
};

// Marker ikonlarını oluşturur
const createColoredIcon = (color) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color:${color};
      width:14px;
      height:14px;
      border-radius:50%;
      border: 2px solid white;
      box-shadow: 0 0 2px rgba(0,0,0,0.5);
    "></div>`
  });

function MapComponent({
  railLine = [],
  detections = [],
  classMap = {},
  classColors = {},
  selectedClassId = null
}) {
  return (
    <div className="w-full h-[400px] mb-4 rounded overflow-hidden transition-all duration-300">
      <MapContainer
        center={railLine[0] || [39.9, 31.5]}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Demiryolu hattı çizgisi */}
        <Polyline positions={railLine} color="black" weight={4} />

        {/* Markerlar */}
        {(detections || []).map((item, index) => {
          const firstDefect = item.result.find(r =>
            ![5, 6, 8].includes(r.class_id) &&
            (selectedClassId === null || r.class_id === selectedClassId)
          );

          if (!firstDefect) return null;

          const severity = severityConfig[firstDefect.class_id] || {
            color: "gray",
            level: "Bilinmeyen Seviye"
          };

          const icon = createColoredIcon(severity.color);

          return (
            <Marker key={index} position={[item.gps.lat, item.gps.lng]} icon={icon}>
              <Popup>
                <strong>{item.filename}</strong><br />
                {new Date(item.timestamp).toLocaleString()}<br />
                <p className="mt-2">
                  <strong style={{ color: severity.color }}>{severity.level}</strong>
                </p>
                <ul className="mt-2 text-sm">
                  {item.result
                    .filter(r =>
                      ![5, 6, 8].includes(r.class_id) &&
                      (selectedClassId === null || r.class_id === selectedClassId)
                    )
                    .map((r, i) => (
                      <li key={i}>
                        <span style={{ color: classColors[r.class_id] || "black" }}>
                          {classMap[r.class_id] || `Class ${r.class_id}`}
                        </span>
                        {` (${r.source}) – Conf: ${r.confidence}`}
                      </li>
                    ))}
                </ul>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
