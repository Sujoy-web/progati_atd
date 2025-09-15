// pages/YearPlannerPage.jsx
import { useState, useEffect } from "react";
import HolidayActions from "../Components/YearPlanner/HolidayActions";
import HolidayForm from "../Components/YearPlanner/HolidayForm";
import HolidayTable from "../Components/YearPlanner/HolidayTable";
import { StatusMessage } from "../Components/YearPlanner/StatusMessage";

// Demo sessions
const DEMO_SESSIONS = ["2024-25", "2025-26", "2026-27"];

// LocalStorage key
const STORAGE_KEY = "holidaysData";

export default function YearPlannerPage() {
  const [holidays, setHolidays] = useState([]);
  const [sessions] = useState(DEMO_SESSIONS);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", start: "", end: "" });

  // Load holidays from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setHolidays(stored);
  }, []);

  const saveToStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setHolidays(data);
  };

  const showStatus = (msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3000);
  };

  const calcDays = (s, e) => {
    const start = new Date(s);
    const end = new Date(e);
    const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
    return diff > 0 ? diff : 0;
  };

  // CRUD operations using localStorage

  const addHoliday = ({ session, name, start, end }) => {
    if (!session || !name || !start || !end) return showStatus("Fill all fields", "error");
    const newHoliday = { id: Date.now(), session, name, start, end, active: true };
    saveToStorage([...holidays, newHoliday]);
    showStatus("Holiday added successfully", "success");
  };

  const toggleActive = (id) => {
    const updated = holidays.map(h => h.id === id ? { ...h, active: !h.active } : h);
    saveToStorage(updated);
  };

  const deleteHoliday = (id) => {
    const updated = holidays.filter(h => h.id !== id);
    saveToStorage(updated);
    showStatus("Holiday deleted", "success");
  };

  const startEditing = (h) => {
    setEditingId(h.id);
    setEditForm({ name: h.name, start: h.start, end: h.end });
  };

  const saveEdit = (id) => {
    const updated = holidays.map(h => h.id === id ? { ...h, ...editForm } : h);
    saveToStorage(updated);
    setEditingId(null);
    showStatus("Holiday updated", "success");
  };

  const exportCSV = () => {
    const headers = ["Sl", "Holiday Name", "Session", "Start Date", "End Date", "Total Days"];
    const activeHolidays = holidays.filter(h => h.active);
    const csvContent = [
      headers.join(","),
      ...activeHolidays.map((h, i) => [
        i + 1,
        `"${h.name}"`,
        `"${h.session}"`,
        h.start,
        h.end,
        calcDays(h.start, h.end)
      ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "HolidayPlanner.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus("Exported to CSV successfully", "success");
  };

  const printTable = () => {
    const table = document.getElementById("holidayTable").cloneNode(true);
    const newWin = window.open("", "_blank", "width=900,height=700");
    newWin.document.write(`<html><head><title>Holiday Planner</title><style>
      body{font-family:Arial,sans-serif;padding:20px;color:#333;}
      table{width:100%;border-collapse:collapse;margin-bottom:20px;}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;}
      th{background-color:#2d3748;color:white;}
    </style></head><body><h2>Holiday Planner</h2>`);
    newWin.document.write(table.outerHTML);
    newWin.document.write("</body></html>");
    newWin.document.close();
    setTimeout(() => newWin.print(), 250);
  };

  // Filtered holidays
  const filtered = holidays.filter(h =>
    searchTerm === "" ||
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.session.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <StatusMessage status={status} setStatus={setStatus} loading={loading} />

      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Holiday Planner</h1>
        <p className="text-gray-400">Manage and track holidays for academic sessions</p>
      </div>

      <HolidayForm sessions={sessions} addHoliday={addHoliday} loading={loading} />
      <HolidayActions searchTerm={searchTerm} setSearchTerm={setSearchTerm} exportCSV={exportCSV} printTable={printTable} />
      <HolidayTable
        holidays={filtered}
        toggleActive={toggleActive}
        deleteHoliday={deleteHoliday}
        startEditing={startEditing}
        editingId={editingId}
        editForm={editForm}
        setEditForm={setEditForm}
        saveEdit={saveEdit}
        calcDays={calcDays}
      />

      {filtered.length > 0 && (
        <div id="tableFooter" className="bg-gray-800 text-gray-200 p-4 text-center mt-2">
          Total active holidays: {filtered.filter(h => h.active).length} | Total days: {filtered.filter(h => h.active).reduce((sum,h)=>sum+calcDays(h.start,h.end),0)}
        </div>
      )}
    </div>
  );
}
