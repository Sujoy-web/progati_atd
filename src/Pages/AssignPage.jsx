// pages/RfidAssignPage.jsx
import { useState, useEffect, useRef } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

// Component imports
import SelectedStudentCard from "../Components/Assign/SelectedStudentCard";
import StudentsTable from "../Components/Assign/StudentsTable";
import SearchAndInput from "../Components/Assign/SearchAndInput";
import FiltersBar from "../Components/Assign/FilterBar";

// Storage utilities
import { loadData, saveData } from "../utils/storage";

const STORAGE_KEY = "rfidSimpleAssignments";

// ================== Initial Student Data ==================
// IDs restart from 1 for each class
const initialStudents = [
  // Class 1
  { id: "1", name: "Alice", roll: "01", adm: "ADM001", class: "I", section: "A", session: "2025-2026", rfid: "" },
  { id: "2", name: "Charlie", roll: "02", adm: "ADM002", class: "I", section: "B", session: "2025-2026", rfid: "" },

  // Class 2
  { id: "1", name: "Bob", roll: "01", adm: "ADM003", class: "II", section: "A", session: "2025-2026", rfid: "" },
  { id: "2", name: "Rohan", roll: "02", adm: "ADM004", class: "II", section: "B", session: "2025-2026", rfid: "" },

  // Class 3
  { id: "1", name: "Sujoy", roll: "01", adm: "ADM005", class: "III", section: "A", session: "2025-2026", rfid: "" },
  { id: "2", name: "Arjun", roll: "02", adm: "ADM006", class: "III", section: "B", session: "2025-2026", rfid: "" },
];

// Helper: create unique key for each student
const getUniqueId = (s) => `${s.class}-${s.section}-${s.id}`;

export default function AssignPage() {
  // ================== State ==================
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [classSel, setClassSel] = useState("");
  const [sectionSel, setSectionSel] = useState("");
  const [sessionSel, setSessionSel] = useState("");
  const [filter, setFilter] = useState("all");

  const [rfid, setRfid] = useState("");
  const [status, setStatus] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const inputRef = useRef(null);
  const searchRef = useRef(null);

  // ================== Effects ==================
  // Load dropdown values
  useEffect(() => {
    setClasses([...new Set(initialStudents.map((s) => s.class))]);
    setSections([...new Set(initialStudents.map((s) => s.section))]);
    setSessions([...new Set(initialStudents.map((s) => s.session))]);
  }, []);

  // Load students (apply filters OR show all if no filter)
  useEffect(() => {
    const saved = loadData(STORAGE_KEY, []);

    let filtered = initialStudents.map((s) => {
      const uniqueId = getUniqueId(s);
      const f = saved.find((x) => x.uid === uniqueId);
      return f ? { ...s, rfid: f.rfid } : s;
    });

    if (classSel) filtered = filtered.filter((s) => s.class === classSel);
    if (sectionSel) filtered = filtered.filter((s) => s.section === sectionSel);
    if (sessionSel) filtered = filtered.filter((s) => s.session === sessionSel);

    setStudents(filtered);
    setSelectedStudent(null);
  }, [classSel, sectionSel, sessionSel]);

  useEffect(() => {
    if (classSel || sectionSel || sessionSel) inputRef.current?.focus();
  }, [classSel, sectionSel, sessionSel]);

  // ================== Utilities ==================
  const showStatus = (msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3000);
  };

  const saveToStorage = (arr) => {
    const saveFormat = arr.map((s) => ({
      uid: getUniqueId(s),
      rfid: s.rfid,
    }));
    saveData(STORAGE_KEY, saveFormat);
  };

  // ================== Core Logic ==================
  const assignRfid = () => {
    if (!rfid.trim()) return showStatus("Scan RFID first", "error");

    // RFID must be unique across all students
    if (students.some((s) => s.rfid === rfid.trim())) {
      setRfid("");
      inputRef.current?.focus();
      return showStatus("RFID already used", "error");
    }

    if (selectedStudent) {
      const updated = students.map((s) =>
        getUniqueId(s) === getUniqueId(selectedStudent) ? { ...s, rfid: rfid.trim() } : s
      );
      setStudents(updated);
      saveToStorage(updated);
      showStatus(`RFID assigned to ${selectedStudent.name}`, "success");
      setRfid("");
      setSelectedStudent(null);
      inputRef.current?.focus();
      return;
    }

    // Auto-assign to first unassigned student
    const idx = students.findIndex((s) => !s.rfid);
    if (idx < 0) {
      setRfid("");
      inputRef.current?.focus();
      return showStatus("No unassigned student", "error");
    }

    const updated = [...students];
    updated[idx].rfid = rfid.trim();
    setStudents(updated);
    saveToStorage(updated);
    showStatus(`RFID assigned to ${updated[idx].name}`, "success");
    setRfid("");
    inputRef.current?.focus();
  };

  const handleRemove = (uid) => {
    const student = students.find((s) => getUniqueId(s) === uid);
    const updated = students.map((s) =>
      getUniqueId(s) === uid ? { ...s, rfid: "" } : s
    );
    setStudents(updated);
    saveToStorage(updated);
    showStatus(`RFID removed from ${student?.name}`, "success");
    inputRef.current?.focus();
  };

  const selectFirstMatchingStudent = () => {
    if (!searchTerm.trim()) return;
    const found = students.find(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.adm.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (found) {
      setSelectedStudent(found);
      showStatus(`Selected: ${found.name}`, "success");
      inputRef.current?.focus();
    } else {
      setSelectedStudent(null);
      showStatus("No student found", "error");
      inputRef.current?.focus();
    }
  };

  const handleRowDoubleClick = (student) => {
    setSelectedStudent(student);
    showStatus(`Selected: ${student.name}`, "success");
    inputRef.current?.focus();
  };

  // ================== Filtering ==================
  const filtered = students.filter((s) => {
    const matchesSearch =
      searchTerm === "" ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.adm.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "assigned") return matchesSearch && s.rfid;
    if (filter === "unassigned") return matchesSearch && !s.rfid;
    return matchesSearch;
  });

  // ================== JSX ==================
  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      {/* Status message */}
      {status && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
            status.type === "success" ? "bg-green-800" : "bg-red-800"
          }`}
        >
          <div className="text-xl">
            {status.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
          </div>
          <p>{status.msg}</p>
          <button onClick={() => setStatus(null)} className="ml-2">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Filters */}
      <FiltersBar
        classes={classes}
        sections={sections}
        sessions={sessions}
        classSel={classSel}
        sectionSel={sectionSel}
        sessionSel={sessionSel}
        filter={filter}
        setClassSel={setClassSel}
        setSectionSel={setSectionSel}
        setSessionSel={setSessionSel}
        setFilter={setFilter}
      />

      {/* Content */}
      <>
        {/* Search + Input */}
        <SearchAndInput
          searchRef={searchRef}
          inputRef={inputRef}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          clearSearch={() => {
            setSearchTerm("");
            setSelectedStudent(null);
            searchRef.current?.focus();
          }}
          selectFirstMatchingStudent={selectFirstMatchingStudent}
          rfid={rfid}
          setRfid={setRfid}
          assignRfid={assignRfid}
        />

        {/* Selected card */}
        {selectedStudent && (
          <SelectedStudentCard
            student={selectedStudent}
            clear={() => {
              setSelectedStudent(null);
              inputRef.current?.focus();
            }}
          />
        )}

        {/* Info */}
        <div className="max-w-6xl mx-auto mb-3">
          <p className="text-sm text-gray-400">
            Showing {filtered.length} of {students.length} students
            {searchTerm && ` matching "${searchTerm}"`} | Double-click to select
          </p>
        </div>

        {/* Table */}
        <StudentsTable
          students={filtered}
          selectedStudent={selectedStudent}
          handleRowDoubleClick={handleRowDoubleClick}
          handleRemove={(student) => handleRemove(getUniqueId(student))}
        />
      </>
    </div>
  );
}