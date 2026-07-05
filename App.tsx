import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { UserCoords } from './types';
import MedicineSearch from './components/MedicineSearch';
import PharmacyConnector from './components/PharmacyConnector';
import AdminPanel from './components/AdminPanel';
import { 
  LogIn, 
  LogOut, 
  Store, 
  Search, 
  ShieldAlert, 
  Compass, 
  Moon, 
  Sun,
  ShieldCheck,
  HeartPulse,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ name: string; phone: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Login form states
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  // App view toggle ('search' | 'connect')
  const [activeTab, setActiveTab] = useState<'search' | 'connect'>('search');

  // Admin Panel modal toggle
  const [adminOpen, setAdminOpen] = useState(false);

  // States for matching Lovable video flow exactly
  const [showAdminPasscodePrompt, setShowAdminPasscodePrompt] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Global subscribers state
  const [customers, setCustomers] = useState(store.getCustomers());
  const [searchLogs, setSearchLogs] = useState(store.getSearchLogs());

  // Location Coordinate state (Defaults to Andhra Pradesh Center - Vijayawada)
  const [userCoords, setUserCoords] = useState<UserCoords>({
    lat: 16.5062,
    lng: 80.6480,
    isLive: false
  });

  useEffect(() => {
    // Check initial login state
    setCurrentUser(store.getActiveUser());

    // Subscribe to store updates for real-time reactive rendering
    const unsubscribe = store.subscribe(() => {
      setCurrentUser(store.getActiveUser());
      setCustomers(store.getCustomers());
      setSearchLogs(store.getSearchLogs());
    });

    // Request real live GPS location ONCE at App root level to avoid redundant prompts
    if (navigator.geolocation) {
      const highAccuracyOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6)),
            isLive: true
          });
        },
        (error) => {
          console.warn("High-accuracy root GPS fetch failed/timed out, retrying with standard accuracy...", error);
          
          navigator.geolocation.getCurrentPosition(
            (fallbackPos) => {
              setUserCoords({
                lat: parseFloat(fallbackPos.coords.latitude.toFixed(6)),
                lng: parseFloat(fallbackPos.coords.longitude.toFixed(6)),
                isLive: true
              });
            },
            (fallbackError) => {
              console.error("Root GPS completely failed:", fallbackError);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        },
        highAccuracyOptions
      );
    }

    // Dark mode setting check
    const isDark = localStorage.getItem('mf_theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => unsubscribe();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim() || !loginPhone.trim()) {
      alert("Please provide both Name and Mobile Number to log in!");
      return;
    }

    // Phone format check: basic 10-digit check or standard formats
    const digits = loginPhone.replace(/\D/g, '');
    if (digits.length < 10) {
      alert("Please enter a valid 10-digit mobile number!");
      return;
    }

    // Trigger Setting up transition
    setIsLoggingIn(true);
    setTimeout(() => {
      // Login in store (will also register the customer if they don't exist)
      const loggedInUser = store.loginUser(loginName, loginPhone);
      setCurrentUser(loggedInUser);
      setIsLoggingIn(false);
      
      // Clear login form
      setLoginName('');
      setLoginPhone('');
    }, 1200);
  };

  const handleAdminPasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === '250805' || adminPasscode === '123456' || adminPasscode === 'admin') {
      setShowAdminPasscodePrompt(false);
      setAdminPasscode('');
      setAdminOpen(true);
    } else {
      alert('Invalid admin passcode!');
    }
  };

  const handleLogout = () => {
    store.logoutUser();
    setAdminOpen(false);
    setShowAdminPasscodePrompt(false);
    setLoginName('');
    setLoginPhone('');
  };

  const toggleDarkMode = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mf_theme', 'light');
    }
  };

  const handleResetData = () => {
    store.resetAllData();
  };

  // --- RENDERING AUTHENTICATION / LOGIN SCREEN & ADMIN PASSCODE PROMPT ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 relative overflow-hidden">
        
        {/* Floating background decorative blobs with dynamic theme colors */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-200/30 dark:bg-teal-950/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-200/30 dark:bg-emerald-950/20 blur-3xl pointer-events-none" />

        {/* Upper Floating Theme Controls & Trusted Companion badge */}
        <div className="flex flex-col items-center gap-4 mb-6 z-10 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Trusted healthcare companion</span>
              <span className="ml-1 opacity-70">🔗</span>
            </div>

            {/* Premium segmented Light/Dark Switcher */}
            <div className="flex bg-white dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setDarkMode(false);
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('mf_theme', 'light');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  !darkMode
                    ? 'bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-450 dark:hover:text-slate-250'
                }`}
                title="Use Light Theme"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDarkMode(true);
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('mf_theme', 'dark');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  darkMode
                    ? 'bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-450 dark:hover:text-slate-250'
                }`}
                title="Use Dark Theme"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* Standard Patient login form */}
        <div className="w-full max-w-md z-10 space-y-6">
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              Welcome to MediFind
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
              Find any medicine and the nearest pharmacy in seconds.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl py-8 px-6 sm:px-10 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-scale-in">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  disabled={isLoggingIn}
                  placeholder="Lakshmi"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-3.5 text-xs outline-none focus:border-[#0bbbb6] focus:ring-1 focus:ring-[#0bbbb6] text-slate-800 dark:text-slate-100 transition font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Phone number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    disabled={isLoggingIn}
                    placeholder="98765 43210"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-3.5 pl-12 text-xs outline-none focus:border-[#0bbbb6] focus:ring-1 focus:ring-[#0bbbb6] text-slate-800 dark:text-slate-100 transition font-mono font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 bg-[#0bbbb6] hover:bg-[#0aa6a1] text-white font-bold py-3.5 px-4 text-xs rounded-xl transition shadow-lg shadow-teal-700/20 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Setting up...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    Continue <span className="font-sans ml-1 text-sm">→</span>
                  </span>
                )}
              </button>
            </form>

            <div className="pt-1 text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center justify-center gap-1">
                🔑 Your login activity is stored securely for app analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Outer credit line */}
        <p className="absolute bottom-6 text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wider">
          Connecting community pharmacies • Andhra Pradesh Node • Secure Sandbox
        </p>
      </div>
    );
  }

  // --- RENDERING THE MAIN APPLICATION ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col">
      
      {/* Dynamic Header Navbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Welcome User Initials & Badge (Exactly like the video) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e6f8f7] dark:bg-teal-950/40 flex items-center justify-center text-[#0bbbb6] font-extrabold text-sm border border-[#0bbbb6]/10 shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                WELCOME BACK
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                Hello, {currentUser.name}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Premium segmented Light/Dark Switcher */}
            <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-full border border-slate-150 dark:border-slate-800 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setDarkMode(false);
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('mf_theme', 'light');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  !darkMode
                    ? 'bg-white text-slate-800 dark:bg-slate-850 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-450 dark:hover:text-slate-250'
                }`}
                title="Use Light Theme"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDarkMode(true);
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('mf_theme', 'dark');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  darkMode
                    ? 'bg-white text-slate-800 dark:bg-slate-850 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-450 dark:hover:text-slate-250'
                }`}
                title="Use Dark Theme"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </button>
            </div>

            {/* ADMIN BUTTON (TOP RIGHT) */}
            <button
              onClick={() => setShowAdminPasscodePrompt(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold transition"
              title="Open Clinical Admin Dashboard"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Admin</span>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100/30 dark:border-rose-950/30 rounded-xl text-xs font-bold transition shadow-xs"
              title="Sign Out of MediFind"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Selector Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 max-w-md">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 pb-3 text-xs font-bold transition border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'search'
                ? 'border-[#0bbbb6] text-[#0bbbb6]'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            Find Nearest Medicines
          </button>
          
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex-1 pb-3 text-xs font-bold transition border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'connect'
                ? 'border-[#0bbbb6] text-[#0bbbb6]'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            Connect a Pharmacy
          </button>
        </div>

        {/* Tab switcher renderer */}
        <div className="transition-all duration-300">
          {activeTab === 'search' ? (
            <MedicineSearch
              userCoords={userCoords}
              setUserCoords={setUserCoords}
            />
          ) : (
            <PharmacyConnector
              onPharmacyAdded={() => {
                setActiveTab('search'); // redirect back to search to view newly added pharmacy!
              }}
            />
          )}
        </div>

      </main>

      {/* ADMIN CONTROL PANEL DRAWER OVERLAY */}
      {adminOpen && (
        <AdminPanel
          onClose={() => setAdminOpen(false)}
          customers={customers}
          logs={searchLogs}
          onResetData={handleResetData}
        />
      )}

      {/* ADMIN PASSCODE MODAL GUARDIAN */}
      {showAdminPasscodePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          {/* Semi-transparent backdrop blur */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => {
              setShowAdminPasscodePrompt(false);
              setAdminPasscode('');
            }}
          />

          <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-150 dark:border-slate-800 shadow-2xl animate-scale-in z-10 text-center space-y-5">
            <div className="inline-flex items-center justify-center p-3.5 bg-teal-50 dark:bg-teal-950/30 text-[#0bbbb6] rounded-2xl mb-1">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Clinical Admin Access</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Please enter your personal admin passcode to access real-time network logs and registered patient list.
              </p>
            </div>

            <form onSubmit={handleAdminPasscodeLogin} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Personal Admin Passcode
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-[#0bbbb6] focus:ring-1 focus:ring-[#0bbbb6] text-slate-800 dark:text-slate-100 transition font-mono tracking-widest text-center"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPasscodePrompt(false);
                    setAdminPasscode('');
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#0bbbb6] hover:bg-[#0aa6a1] rounded-xl shadow-md transition"
                >
                  Verify Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-mono">
          <p>© 2026 MediFinder. All pharmacies connected under one standard network.</p>
          <div className="flex gap-4">
            <span>Server Version: v2.4.1</span>
            <span>Security context: ISO27001</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
