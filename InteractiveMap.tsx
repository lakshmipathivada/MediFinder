import React, { useState, useEffect } from 'react';
import { Pharmacy } from '../types';
import { MapPin, Navigation, Map as MapIcon, Compass } from 'lucide-react';

interface InteractiveMapProps {
  pharmacies: Pharmacy[];
  userLat: number;
  userLng: number;
  selectedPharmacyId: string | null;
  onSelectPharmacy: (id: string) => void;
  onMapClickToSimulateLocation?: (lat: number, lng: number) => void;
  isLive?: boolean;
}

export default function InteractiveMap({
  pharmacies,
  userLat,
  userLng,
  selectedPharmacyId,
  onSelectPharmacy,
  onMapClickToSimulateLocation,
  isLive
}: InteractiveMapProps) {
  
  // Theme state observer
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<'google-map' | 'grid'>('google-map');

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Projection function: Convert real Lat/Lng in Andhra Pradesh (Vijayawada) to SVG pixels [0, 0, 500, 360]
  const mapCenterLat = 16.5062;
  const mapCenterLng = 80.6480;
  const latScale = 14000; // units per degree (zoomed in to match town scale)
  const lngScale = 14000;

  const project = (lat: number, lng: number) => {
    const x = 250 + (lng - mapCenterLng) * lngScale;
    const y = 180 - (lat - mapCenterLat) * latScale; // flip Y
    return {
      x: Math.max(15, Math.min(485, x)),
      y: Math.max(15, Math.min(345, y))
    };
  };

  const userPos = project(userLat, userLng);
  const selectedPharmacy = pharmacies.find(p => p.id === selectedPharmacyId);
  const selectedPos = selectedPharmacy ? project(selectedPharmacy.lat, selectedPharmacy.lng) : null;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onMapClickToSimulateLocation) return;
    
    // Get click coordinates relative to SVG container bounding box
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 500;
    const clickY = ((e.clientY - rect.top) / rect.height) * 360;

    // Inverse projection to get simulated Lat/Lng
    const clickLng = mapCenterLng + (clickX - 250) / lngScale;
    const clickLat = mapCenterLat - (clickY - 180) / latScale;

    // Trigger update
    onMapClickToSimulateLocation(
      parseFloat(clickLat.toFixed(6)),
      parseFloat(clickLng.toFixed(6))
    );
  };

  // Dynamic colors for light and dark backgrounds
  const roadColor = isDark ? "#1e293b" : "#cbd5e1";
  const roadCenterLine = isDark ? "#334155" : "#94a3b8";
  const mapBg = isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(241, 245, 249, 0.8)";
  const gridColor = isDark ? "rgba(51, 65, 85, 0.15)" : "rgba(148, 163, 184, 0.15)";
  const labelColor = isDark ? "fill-slate-500" : "fill-slate-400";

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-inner w-full group transition-all duration-300">
      {/* Map Header Switcher Mode (Google Maps / Custom Grid) */}
      <div className="absolute top-3 left-3 z-20 flex bg-white/95 dark:bg-slate-955/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={() => setViewMode('google-map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
            viewMode === 'google-map'
              ? 'bg-[#0bbbb6] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Google Map View"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Google Map</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('grid')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
            viewMode === 'grid'
              ? 'bg-[#0bbbb6] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Live Simulation Grid"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Simulation Grid</span>
        </button>
      </div>

      <div className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 border px-2.5 py-1.5 rounded-xl backdrop-blur-md text-[9px] font-mono shadow-xs transition-colors duration-350 ${
        isLive 
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold' 
          : 'bg-white/95 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
      }`}>
        <Compass className={`w-3 h-3 ${isLive ? 'text-emerald-500 animate-spin-slow' : 'text-[#0bbbb6] animate-spin-slow'}`} />
        <span>{isLive ? '📡 LIVE GPS: ' : 'GPS PIN: '}{userLat.toFixed(4)}, {userLng.toFixed(4)}</span>
        {isLive && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
        )}
      </div>

      {/* Helper text overlay - only visible in Grid simulation mode */}
      {viewMode === 'grid' && (
        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none text-center sm:text-left">
          <span className="inline-block bg-white/95 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-[9px] text-slate-500 dark:text-slate-400 rounded-lg backdrop-blur-xs shadow-xs">
            💡 Click anywhere on the grid to simulate an Andhra Pradesh location.
          </span>
        </div>
      )}

      {/* Vector SVG Canvas vs Live Google Map */}
      {viewMode === 'google-map' ? (
        <div className="w-full h-[360px] relative bg-slate-50 dark:bg-slate-950">
          <iframe
            title="Google Map View"
            width="100%"
            height="360"
            style={{ border: 0 }}
            src={
              selectedPharmacy 
                ? `https://maps.google.com/maps?q=${selectedPharmacy.lat},${selectedPharmacy.lng}(${encodeURIComponent(selectedPharmacy.name)})&t=&z=16&ie=UTF8&iwloc=&output=embed`
                : `https://maps.google.com/maps?q=${userLat},${userLng}(My%20Location)&t=&z=14&ie=UTF8&iwloc=&output=embed`
            }
            allowFullScreen
            referrerPolicy="no-referrer"
            className="w-full h-full block"
          />
        </div>
      ) : (
        <svg 
          viewBox="0 0 500 360" 
          className="w-full h-auto cursor-crosshair select-none block transition-colors duration-300"
          style={{ backgroundColor: mapBg }}
          onClick={handleSvgClick}
        >
          {/* Decorative Grid Lines */}
          <defs>
            <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke={gridColor} strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="500" height="360" fill="url(#grid)" />

          {/* Vectorized Roads and Highways (Andhra Pradesh Sim) */}
          {/* M.G. Road */}
          <path d="M 0 100 L 500 240" fill="none" stroke={roadColor} strokeWidth="12" strokeLinecap="round" className="opacity-70 transition-all duration-300" />
          <path d="M 0 100 L 500 240" fill="none" stroke={roadCenterLine} strokeWidth="1.5" strokeDasharray="5 5" strokeLinecap="round" />
          
          {/* National Highway 16 */}
          <path d="M 120 0 L 140 360" fill="none" stroke={roadColor} strokeWidth="14" strokeLinecap="round" className="opacity-70 transition-all duration-300" />
          <path d="M 120 0 L 140 360" fill="none" stroke={roadCenterLine} strokeWidth="1.5" strokeDasharray="6 4" strokeLinecap="round" />

          {/* Eluru Road */}
          <path d="M 0 260 C 150 250, 300 180, 500 150" fill="none" stroke={roadColor} strokeWidth="10" strokeLinecap="round" className="opacity-50 transition-all duration-300" />
          <path d="M 0 260 C 150 250, 300 180, 500 150" fill="none" stroke={roadCenterLine} strokeWidth="1" strokeDasharray="3 3" />

          {/* Bandar Road */}
          <path d="M 320 0 C 330 120, 310 240, 350 360" fill="none" stroke={roadColor} strokeWidth="10" strokeLinecap="round" className="opacity-50 transition-all duration-300" />

          {/* Road names */}
          <text x="20" y="85" className={`${labelColor} font-mono text-[7px] uppercase tracking-wider`} transform="rotate(15 20 85)">M.G. Road</text>
          <text x="145" y="300" className={`${labelColor} font-mono text-[7px] uppercase tracking-wider`} transform="rotate(85 145 300)">NH16 Bypass</text>
          <text x="360" y="80" className={`${labelColor} font-mono text-[7px] uppercase tracking-wider`} transform="rotate(80 360 80)">Bandar Road</text>

          {/* ACTIVE ROUTE / DIRECTION GLOW PATH LINE (Teal/Light Green) */}
          {selectedPos && (
            <>
              {/* Pulsing neon backing direction pathway */}
              <path 
                d={`M ${userPos.x} ${userPos.y} Q ${(userPos.x + selectedPos.x) / 2 + 30} ${(userPos.y + selectedPos.y) / 2 - 30}, ${selectedPos.x} ${selectedPos.y}`} 
                fill="none" 
                stroke="#0bbbb6" 
                strokeWidth="4" 
                strokeLinecap="round" 
                className="opacity-60 blur-[3px]"
              />
              {/* Solid sharp navigation arrow path */}
              <path 
                d={`M ${userPos.x} ${userPos.y} Q ${(userPos.x + selectedPos.x) / 2 + 30} ${(userPos.y + selectedPos.y) / 2 - 30}, ${selectedPos.x} ${selectedPos.y}`} 
                fill="none" 
                stroke="#2dd4bf" 
                strokeWidth="2.5" 
                strokeDasharray="6 4" 
                strokeLinecap="round"
                className="animate-[dash_10s_linear_infinite]"
              />
            </>
          )}

          {/* PHARMACIES PIN MARKERS */}
          {pharmacies.map((ph) => {
            const pos = project(ph.lat, ph.lng);
            const isSelected = ph.id === selectedPharmacyId;

            return (
              <g 
                key={ph.id} 
                className="cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation(); // Stop general SVG clicks
                  onSelectPharmacy(ph.id);
                }}
              >
                {/* Radar pulse for selected pharmacy (Teal/Light Green) */}
                {isSelected && (
                  <circle 
                    cx={pos.x} 
                    cy={pos.y} 
                    r="18" 
                    fill="none" 
                    stroke="#0bbbb6" 
                    strokeWidth="1.5" 
                    className="animate-ping"
                  />
                )}

                {/* Pin container background */}
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r={isSelected ? "11" : "8"} 
                  fill={isSelected ? "#0bbbb6" : (isDark ? "#1e293b" : "#475569")} 
                  className="stroke-white stroke-2 transition-all duration-300 shadow-md" 
                />

                {/* Crosshair inside pin */}
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r={isSelected ? "4" : "3"} 
                  fill={isSelected ? "#ffffff" : "#0bbbb6"} 
                />

                {/* Small popup text label above pins */}
                <g transform={`translate(${pos.x}, ${pos.y - (isSelected ? 16 : 12)})`}>
                  <rect 
                    x="-45" 
                    y="-11" 
                    width="90" 
                    height="14" 
                    rx="3" 
                    fill={isSelected ? "#0bbbb6" : (isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)")} 
                    stroke={isSelected ? "#ffffff" : (isDark ? "#475569" : "#cbd5e1")} 
                    strokeWidth="0.5" 
                  />
                  <text 
                    textAnchor="middle" 
                    y="-2" 
                    className={`${isSelected || isDark ? "fill-white" : "fill-slate-800"} font-sans text-[7px] font-bold`}
                  >
                    {ph.name.slice(0, 15)}
                  </text>
                </g>
              </g>
            );
          })}

          {/* USER LOCATION GLOW PULSATING MARKER (Teal/Light Green) */}
          <g>
            {/* Outer ripples */}
            <circle 
              cx={userPos.x} 
              cy={userPos.y} 
              r="15" 
              fill="none" 
              stroke="#0bbbb6" 
              strokeWidth="1" 
              className="animate-ping opacity-75" 
            />
            <circle 
              cx={userPos.x} 
              cy={userPos.y} 
              r="7" 
              fill="#0bbbb6" 
              className="stroke-white stroke-[1.5px] shadow-lg" 
            />
            <circle 
              cx={userPos.x} 
              cy={userPos.y} 
              r="2.5" 
              fill="#ffffff" 
            />
            {/* User Location Label banner */}
            <g transform={`translate(${userPos.x}, ${userPos.y + 16})`}>
              <rect 
                x="-25" 
                y="-1" 
                width="50" 
                height="10" 
                rx="2" 
                fill="#0bbbb6" 
              />
              <text 
                textAnchor="middle" 
                y="7" 
                className="fill-white font-mono text-[5.5px] font-black uppercase tracking-wider"
              >
                My Position
              </text>
            </g>
          </g>
        </svg>
      )}

      {/* Bottom status bar for Directions Overlay (Teal styled) */}
      {selectedPharmacy && (
        <div className="absolute top-14 left-3 right-3 bg-white/95 dark:bg-slate-955/90 border border-slate-200 dark:border-[#0bbbb6]/30 p-2.5 rounded-xl flex items-center gap-3 animate-fade-in backdrop-blur-md shadow-sm">
          <div className="p-1.5 bg-[#e6f8f7] dark:bg-teal-950/40 text-[#0bbbb6] rounded-lg">
            <Navigation className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-[#0bbbb6] font-mono font-bold uppercase tracking-widest leading-none">Directions Active</p>
            <p className="text-[10px] text-slate-800 dark:text-slate-100 font-medium truncate mt-0.5">
              Path to <strong className="text-[#0bbbb6]">{selectedPharmacy.name}</strong> • Rating: ⭐ {selectedPharmacy.rating}
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#0bbbb6] bg-[#e6f8f7] dark:bg-teal-950/40 px-2 py-0.5 rounded-md border border-[#0bbbb6]/10 shrink-0">
            Live Route Guide
          </span>
        </div>
      )}
    </div>
  );
}
