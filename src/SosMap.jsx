import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const cyanIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function SosMap({ center, sosLocation, volunteers = [], liveVolunteerLocation = null, height = "300px" }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700" style={{ height }}>
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        {sosLocation && (
          <Marker position={[sosLocation.lat, sosLocation.lng]} icon={redIcon}>
            <Popup>🚨 Emergency location</Popup>
          </Marker>
        )}
        {volunteers.map((v, i) => (
          <Marker key={i} position={[v.location.lat, v.location.lng]} icon={cyanIcon}>
            <Popup>{v.displayName} — {v.distance} km away</Popup>
          </Marker>
        ))}
        {liveVolunteerLocation && (
          <Marker position={[liveVolunteerLocation.lat, liveVolunteerLocation.lng]} icon={cyanIcon}>
            <Popup>🚴 Volunteer — live location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

export default SosMap