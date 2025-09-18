// pages/YearPlannerPage.jsx
import { useState, useEffect } from "react";
import HolidayActions from "../Components/YearPlanner/HolidayActions";
import HolidayForm from "../Components/YearPlanner/HolidayForm";
import HolidayTable from "../Components/YearPlanner/HolidayTable";
import { StatusMessage } from "../Components/YearPlanner/StatusMessage";

export default function YearPlannerPage() {
  const [holidays, setHolidays] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", start: "", end: "" });

  // Load sessions + holidays from API on mount
  useEffect(() => {
    fetchSessions();
    fetchHolidays();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions"); // 👉 replace with your real endpoint
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions", err);
    }
  };

  const fetchHolidays = async () => {
    try {
      const res = await fetch("/api/holidays"); // 👉 replace with your real endpoint
      const data = await res.json();
      setHolidays(data);
    } catch (err) {
      console.error("Error fetching holidays", err);
    }
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

  // CRUD operations with API

  const addHoliday = async ({ session, name, start, end }) => {
    if (!session || !name || !start || !end)
      return showStatus("Fill all fields", "error");

    setLoading(true);
    try {
      const res = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session, name, start, end }),
      });
      if (!res.ok) throw new Error("Failed to add holiday");

      showStatus("Holiday added successfully", "success");
      fetchHolidays(); // refresh list
    } catch (err) {
      showStatus("Error adding holiday", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, active) => {
    try {
      await fetch(`/api/holidays/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      fetchHolidays();
    } catch (err) {
      showStatus("Error updating holiday", "error");
    }
  };

  const deleteHoliday = async (id) => {
    try {
      await fetch(`/api/holidays/${id}`, { method: "DELETE" });
      fetchHolidays();
      showStatus("Holiday deleted", "success");
    } catch (err) {
      showStatus("Error deleting holiday", "error");
    }
  };

  const startEditing = (h) => {
    setEditingId(h.id);
    setEditForm({ name: h.name, start: h.start, end: h.end });
  };

  const saveEdit = async (id) => {
    try {
      await fetch(`/api/holidays/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      fetchHolidays();
      showStatus("Holiday updated", "success");
    } catch (err) {
      showStatus("Error updating holiday", "error");
    }
  };

  // Filtered holidays
  const filtered = holidays.filter(
    (h) =>
      searchTerm === "" ||
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.session.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <StatusMessage status={status} setStatus={setStatus} loading={loading} />

      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Holiday Planner</h1>
        <p className="text-gray-400">
          Manage and track holidays for academic sessions
        </p>
      </div>

      {/* Holiday form */}
      <HolidayForm
        sessions={sessions}
        addHoliday={addHoliday}
        loading={loading}
      />

      {/* Actions (search, export, print) */}
      <HolidayActions
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        // exportCSV={exportCSV}  // optional if API provides export
        // printTable={printTable} // optional if API provides print
      />

      {/* Holiday table */}
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
        <div
          id="tableFooter"
          className="bg-gray-800 text-gray-200 p-4 text-center mt-2"
        >
          Total active holidays: {filtered.filter((h) => h.active).length} | Total
          days:{" "}
          {filtered
            .filter((h) => h.active)
            .reduce((sum, h) => sum + calcDays(h.start, h.end), 0)}
        </div>
      )}
    </div>
  );
}
