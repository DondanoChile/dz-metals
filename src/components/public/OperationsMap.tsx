"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Zone {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  active_operations: number;
  visible: boolean;
}

export default function OperationsMap({ zones }: { zones: Zone[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !mapContainer.current || map.current) return;
    mapboxgl.accessToken = token;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-70.4, -30.0],
      zoom: 4.2,
    });
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    zones.filter(z => z.visible).forEach(zone => {
      // Outer wrapper for pulse effect
      const el = document.createElement("div");
      el.style.cssText = "position:relative;width:20px;height:20px;cursor:pointer;";

      // Ping ring
      const ping = document.createElement("div");
      ping.style.cssText = `
        position:absolute;inset:0;border-radius:50%;
        background:rgba(201,168,76,0.4);
        animation:mapPing 2s ease-out infinite;
      `;

      // Core dot
      const dot = document.createElement("div");
      dot.style.cssText = `
        position:absolute;top:3px;left:3px;
        width:14px;height:14px;border-radius:50%;
        background:#C9A84C;border:2px solid #A07830;
        box-shadow:0 0 10px rgba(201,168,76,0.7);
      `;

      el.appendChild(ping);
      el.appendChild(dot);

      // Inject keyframes once
      if (!document.getElementById("map-ping-style")) {
        const style = document.createElement("style");
        style.id = "map-ping-style";
        style.textContent = `
          @keyframes mapPing {
            0%   { transform: scale(1);   opacity: 0.7; }
            70%  { transform: scale(2.2); opacity: 0;   }
            100% { transform: scale(2.2); opacity: 0;   }
          }
        `;
        document.head.appendChild(style);
      }

      new mapboxgl.Marker(el)
        .setLngLat([zone.longitude, zone.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 20, className: "mapbox-popup-dark" })
          .setHTML(`<div style="font-family:Inter,sans-serif;padding:8px;background:#141414;color:#F5F0E8;border:1px solid #2A2A2A;border-radius:4px;"><strong style="color:#C9A84C">${zone.label}</strong><br/><span style="font-size:12px">${zone.active_operations} operaciones activas</span></div>`))
        .addTo(map.current!);
    });
    return () => { map.current?.remove(); map.current = null; };
  }, [token, zones]);

  if (!token) {
    return (
      <div className="w-full h-[500px] bg-[#141414] border border-[#2A2A2A] rounded-lg flex items-center justify-center">
        <p className="text-[#9A9A8A] text-sm">Mapa de operaciones (configura NEXT_PUBLIC_MAPBOX_TOKEN)</p>
      </div>
    );
  }
  return <div ref={mapContainer} className="w-full h-[500px] rounded-lg overflow-hidden border border-[#2A2A2A]" />;
}
