// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./Layout/AppLayout";
import AssignPage from "./Pages/AssignPage";
import YearPlannerPage from "./Pages/YearPlannerPage";
import AttendanceTimeSetupPage from "./Pages/AttendanceTimeSetupPage";
import RfidAttendancePage from "./Pages/RfidAttendancePage";
import AttendanceReportPage from "./Pages/AttendanceReportPage";

// Storage utilities
export const loadData = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

export const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const clearAllStorage = () => {
  localStorage.clear();
};

export const getStorageSize = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

function App() {
  const [storageSize, setStorageSize] = useState(0);
  const [showClearButton, setShowClearButton] = useState(false);

  useEffect(() => {
    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === 'development';
    setShowClearButton(isDevMode);
    
    // Update storage size on component mount
    updateStorageSize();
    
    // Set up storage change listener
    window.addEventListener('storage', updateStorageSize);
    
    return () => {
      window.removeEventListener('storage', updateStorageSize);
    };
  }, []);

  const updateStorageSize = () => {
    setStorageSize(getStorageSize());
  };

  const handleClearStorage = () => {
    clearAllStorage();
    updateStorageSize();
    // Force a reload to reset the application state
    window.location.reload();
  };

  return (
    <div className="relative">
      
      
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/assign" element={<AssignPage />} />
            <Route path="/yearplanner" element={<YearPlannerPage />} />
            <Route path="/time" element={<AttendanceTimeSetupPage />} />
            <Route path="/rfidattendance" element={<RfidAttendancePage/>} />
            <Route path="/report" element={<AttendanceReportPage/>} />
          </Route>
        </Routes>
      </Router>
      {showClearButton && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-3 z-50 shadow-lg">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <span className="font-medium animate-pulse">
              LocalStorage Usage: {(storageSize / 1024).toFixed(2)} KB
            </span>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-md"
              onClick={handleClearStorage}
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;