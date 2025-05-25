import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Özel bir marker ikonu (Leaflet default marker fix)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function MapComponent({ gps, timestamp }) {
  if (!gps) return null;

  return (
    <div className="w-full h-96 mt-6 rounded overflow-hidden shadow">
      <MapContainer center={[gps.lat, gps.lng]} zoom={10} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[gps.lat, gps.lng]}>
          <Popup>
            <div>
              <strong>Kusur Konumu</strong> <br />
              🕓 {new Date(timestamp).toLocaleString()}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default MapComponent;
