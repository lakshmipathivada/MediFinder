import React, { useState } from 'react';
import { store } from '../services/store';
import { Plus, Check, Store, Phone, MapPin, DollarSign, ListPlus, Activity, Compass } from 'lucide-react';

interface PharmacyConnectorProps {
  onPharmacyAdded: () => void;
}

export default function PharmacyConnector({ onPharmacyAdded }: PharmacyConnectorProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  // Location Preset coordinates to make placing on the SVG grid a absolute joy
  const [locationPreset, setLocationPreset] = useState('koramangala_3');
  const [customLat, setCustomLat] = useState('12.9300');
  const [customLng, setCustomLng] = useState('77.6200');

  // Popular pre-seeded medicines for quick price configuration
  const [prices, setPrices] = useState({
    'dolo 650': '25.00',
    'paracetamol': '12.00',
    'calpol 650': '24.00',
    'asthalin inhaler': '135.00',
    'azithral 500': '140.00',
    'crocin advance': '14.50',
    'pantocid 40': '115.00',
    'augmentin 625': '195.00',
    'glycomet 500': '60.00'
  });

  const presets = [
    { id: 'koramangala_3', name: 'Koramangala 3rd Block', lat: 12.9300, lng: 77.6200 },
    { id: 'hsr_2', name: 'HSR Layout Sec 2', lat: 12.9050, lng: 77.6400 },
    { id: 'indiranagar_2', name: 'Indiranagar 100 Ft Rd', lat: 12.9650, lng: 77.6410 },
    { id: 'jayanagar_5', name: 'Jayanagar 5th Block', lat: 12.9190, lng: 77.5920 },
    { id: 'mg_road', name: 'MG Road Center', lat: 12.9750, lng: 77.6100 },
    { id: 'custom', name: 'Custom Coordinates', lat: 12.9300, lng: 77.6200 }
  ];

  const [detectingLoc, setDetectingLoc] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setDetectError("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLoc(true);
    setDetectError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomLat(position.coords.latitude.toFixed(6));
        setCustomLng(position.coords.longitude.toFixed(6));
        setLocationPreset('custom');
        setDetectingLoc(false);
      },
      (error) => {
        console.warn("Connector GPS detection rejected/failed:", error);
        setDetectError("Could not fetch GPS automatically (permission denied or timeout). Please enter coordinates manually.");
        setDetectingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePresetChange = (presetId: string) => {
    setLocationPreset(presetId);
    if (presetId === 'custom') return;
    const found = presets.find(p => p.id === presetId);
    if (found) {
      setCustomLat(found.lat.toString());
      setCustomLng(found.lng.toString());
    }
  };

  const handlePriceChange = (med: string, value: string) => {
    setPrices(prev => ({
      ...prev,
      [med]: value
    }));
  };

  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !phone) {
      alert("Please fill in all core fields!");
      return;
    }

    // Parse prices
    const parsedPrices: { [med: string]: number } = {};
    Object.keys(prices).forEach((key) => {
      const val = prices[key as keyof typeof prices];
      parsedPrices[key] = val ? parseFloat(val) : 0;
    });

    // Create entry in global store
    store.connectPharmacy(
      name,
      address,
      parseFloat(customLat),
      parseFloat(customLng),
      phone,
      parsedPrices
    );

    // Reset inputs
    setName('');
    setAddress('');
    setPhone('');
    setSuccess(true);
    
    // Notification callback
    onPharmacyAdded();

    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-850 dark:text-white tracking-tight">Connect Your Pharmacy</h2>
          <p className="text-[10px] text-slate-400 font-mono font-bold tracking-wide uppercase">Join the Unified Indian Clinical Network</p>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed mb-6">
        Register your healthcare outlet to instantly appear in nearby customer medicine searches. Input location coordinate presets, define competitive prices for critical drugs, and sync up instantly.
      </p>

      {success && (
        <div className="mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-center gap-2.5 animate-fade-in">
          <div className="p-1 bg-emerald-500 text-white rounded-full">
            <Check className="w-3 h-3" />
          </div>
          <div>
            <p className="text-xs font-black text-emerald-800 dark:text-emerald-300">Pharmacy Synced successfully!</p>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400">Your store is now globally live on the search grid.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Core details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pharmacy Store Name</label>
            <div className="relative">
              <Store className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Apollo Pharmacy, Jayanagar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 pl-9 text-xs outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. +91 80 4432 1100"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 pl-9 text-xs outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. No. 7, Double Road, Jayanagar 2nd block, Bengaluru, Karnataka"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 pl-9 text-xs outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Location selectors */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Set Location Coordinate Presets</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Region Selector</label>
              <select
                value={locationPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-2 text-xs outline-none"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Latitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-2 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Longitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-2 text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLoc}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-250 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold transition disabled:opacity-50"
            >
              <Compass className={`w-3.5 h-3.5 text-emerald-500 ${detectingLoc ? 'animate-spin' : ''}`} />
              <span>{detectingLoc ? 'Detecting your GPS location...' : 'Auto-Detect My Current GPS Location'}</span>
            </button>
            {detectError && (
              <p className="text-[9px] text-amber-600 dark:text-amber-450 font-semibold text-center">
                ⚠️ {detectError}
              </p>
            )}
          </div>
        </div>

        {/* Medicine Price setting */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <ListPlus className="w-3.5 h-3.5 text-emerald-500" />
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Declare Medicine Pricing (INR ₹)</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.keys(prices).map((med) => (
              <div key={med} className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-500 capitalize">{med}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-[10px] text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    value={prices[med as keyof typeof prices]}
                    onChange={(e) => handlePriceChange(med, e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-1.5 pl-6 text-xs outline-none text-right font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 text-xs rounded-xl transition shadow-md shadow-emerald-600/10"
        >
          <Plus className="w-4 h-4" />
          Connect & Go Live on Search Grid
        </button>

      </form>
    </div>
  );
}
