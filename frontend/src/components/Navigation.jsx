import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import carImg from "../assets/car-top.png"; 

const DEMO_COORD = [28.6139, 77.2090];
const DESTINATIONS = [
  { name: "Home", coords: [28.62, 77.2] },
  { name: "Work", coords: [28.61, 77.22] },
  { name: "Mall", coords: [28.615, 77.21] },
];

function bearing([lat1, lon1], [lat2, lon2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const λ1 = toRad(lon1), λ2 = toRad(lon2);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function distanceMeters([lat1, lon1], [lat2, lon2]) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Navigation() {
  const mapRef = useRef(null);
  const carMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const animationRef = useRef(null);
  const [position, setPosition] = useState(DEMO_COORD);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [heading, setHeading] = useState(0);
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = L.map("map", { zoomControl: false, zoom: 15 }).setView(DEMO_COORD, 14);

    L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; Stadia contributors',
      maxZoom: 20,
    }).addTo(mapRef.current);

    const carIcon = L.divIcon({
      className: "car-div-icon",
      html: `<img src="${carImg}" style="width:56px;height:56px;transform:rotate(0deg)" />`,
      iconSize: [56, 56],
      iconAnchor: [28, 28],
    });

    carMarkerRef.current = L.marker(DEMO_COORD, { icon: carIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
  }, []);

  useEffect(() => {
    let simInterval = null;
    let watchId = null;
    if ("geolocation" in navigator) {
      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, speed, heading: gpsHeading } = pos.coords;
            const coords = [latitude, longitude];
            setPosition(coords);
            setSpeedKmh(speed ? speed * 3.6 : 0);
            setHeading(gpsHeading || 0);
            if (carMarkerRef.current) {
              carMarkerRef.current.setLatLng(coords);
              const img = carMarkerRef.current.getElement()?.querySelector("img");
              if (img) img.style.transform = `rotate(${gpsHeading || 0}deg)`;
            }
            mapRef.current?.panTo(coords, { animate: true });
          },
          () => startSimulation(),
          { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
        );
      } catch {
        startSimulation();
      }
    } else {
      startSimulation();
    }

    function startSimulation() {
      let simPos = DEMO_COORD.slice();
      simInterval = setInterval(() => {
        const next = [simPos[0] + 0.00012, simPos[1] + 0.00008];
        const b = bearing(simPos, next);
        const d = distanceMeters(simPos, next);
        setPosition(next);
        setSpeedKmh((d / 1) * 3.6);
        setHeading(b);
        if (carMarkerRef.current) {
          carMarkerRef.current.setLatLng(next);
          const img = carMarkerRef.current.getElement()?.querySelector("img");
          if (img) img.style.transform = `rotate(${b}deg)`;
          mapRef.current?.panTo(next, { animate: true });
        }
        simPos = next;
      }, 900);
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (simInterval) clearInterval(simInterval);
    };
  }, []);

  function animateAlong(routeCoords, speedMetersPerSec = 10) {
    if (animationRef.current) cancelAnimationFrame(animationRef.current.frame);
    let i = 0, progress = 0, lastTime = null;

    function step(ts) {
      if (!lastTime) lastTime = ts;
      const dt = (ts - lastTime) / 1000;
      lastTime = ts;

      if (i >= routeCoords.length - 1) return;

      const a = routeCoords[i], b = routeCoords[i + 1];
      const segLen = distanceMeters(a, b);
      progress += (speedMetersPerSec * dt) / segLen;

      if (progress >= 1) {
        i++;
        progress -= 1;
        if (i >= routeCoords.length - 1) {
          setPosition(routeCoords.at(-1));
          carMarkerRef.current?.setLatLng(routeCoords.at(-1));
          return;
        }
      }

      const lat = a[0] + (b[0] - a[0]) * progress;
      const lon = a[1] + (b[1] - a[1]) * progress;
      const current = [lat, lon];
      setPosition(current);
      setSpeedKmh(speedMetersPerSec * 3.6);
      const hdg = bearing(a, b);
      setHeading(hdg);

      if (carMarkerRef.current) {
        carMarkerRef.current.setLatLng(current);
        const img = carMarkerRef.current.getElement()?.querySelector("img");
        if (img) img.style.transform = `rotate(${hdg}deg)`;
        mapRef.current?.panTo(current, { animate: true, duration: 0.6 });
      }

      animationRef.current.frame = requestAnimationFrame(step);
    }

    animationRef.current = {};
    animationRef.current.frame = requestAnimationFrame(step);
  }

  const goTo = async (dest) => {
    if (!mapRef.current) return;
    setIsRouting(true);
    const src = `${position[1]},${position[0]}`;
    const dst = `${dest.coords[1]},${dest.coords[0]}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${src};${dst}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const latlon = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
      if (routeLayerRef.current) mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = L.polyline(latlon, { color: "#00ffd0", weight: 4 }).addTo(mapRef.current);
      mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [40, 40] });
      animateAlong(latlon, 12);
    } catch {
      const straight = [position, dest.coords];
      if (routeLayerRef.current) mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = L.polyline(straight, { color: "#ffa500", weight: 4 }).addTo(mapRef.current);
      mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [40, 40] });
      animateAlong(straight, 8);
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className="tesla-dashboard">
      {/* Top Info Bar */}
      <div className="glass-panel top-bar">
        <div>Lat: {position[0].toFixed(5)} | Lon: {position[1].toFixed(5)}</div>
        <div className="info-item">Speed: {Math.round(speedKmh)} km/h</div>
        <div className="info-item">Heading: {Math.round(heading)}°</div>
      </div>

      {/* Map */}
      <div className="map-container">
        <div id="map" className="map"></div>
      </div>

      {/* Bottom Controls */}
      <div className="glass-panel bottom-bar">
        {DESTINATIONS.map((d) => (
          <div
            key={d.name}
            onClick={() => goTo(d)}
            className={`control-item ${isRouting ? "opacity-50 pointer-events-none" : ""}`}
          >
            <span style={{ color: "#00ffd0" }}>●</span> {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}
