// pages/RfidAssignPage.jsx
import { useState, useEffect, useRef } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

// Component imports
import SelectedStudentCard from "../Components/Assign/SelectedStudentCard";
import StudentsTable from "../Components/Assign/StudentsTable";
import SearchAndInput from "../Components/Assign/SearchAndInput";
import FiltersBar from "../Components/Assign/FilterBar";

const STORAGE_KEY = "rfidSimpleAssignments";

// Dummy data (initial students list)
const initialStudents = [
  {
    id: "1",
    name: "Alice",
    roll: "01",
    adm: "ADM001",
    class: "VI",
    section: "A",
    session: "2025-2026",
    rfid: "",
  },
  {
    id: "2",
    name: "Bob",
    roll: "02",
    adm: "ADM002",
    class: "VI",
    section: "A",
    session: "2025-2026",
    rfid: "",
  },
  {
    id: "3",
    name: "Charlie",
    roll: "03",
    adm: "ADM003",
    class: "VI",
    section: "A",
    session: "2025-2026",
    rfid: "",
  },
  {
    id: "4",
    name: "Rohan",
    roll: "04",
    adm: "ADM00",
    class: "VI",
    section: "A",
    session: "2025-2026",
    rfid: "",
  },
  {
    id: "5",
    name: "Sujoy",
    roll: "05",
    adm: "ADM005",
    class: "VI",
    section: "A",
    session: "2025-2026",
    rfid: "",
  },
  {
    id: "6",
    name: "Arjun",
    roll: "06",
    adm: "ADM006",
    class: "VI",
    section: "A",
    session: "2025-2026",
    rfid: "",
  },
];

export default function AssignPage() {
  // ================== State variables ==================
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [classSel, setClassSel] = useState("");
  const [sectionSel, setSectionSel] = useState("");
  const [sessionSel, setSessionSel] = useState("");

  // Filter (assigned/unassigned/all)
  const [filter, setFilter] = useState("all");

  // RFID handling
  const [rfid, setRfid] = useState("");
  const [status, setStatus] = useState(null);

  // Search + selected student
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Refs
  const inputRef = useRef(null);
  const searchRef = useRef(null);

  // ================== Effects ==================
  // Load dropdowns (classes, sections, sessions)
  useEffect(() => {
    setClasses([...new Set(initialStudents.map((s) => s.class))]);
    setSections([...new Set(initialStudents.map((s) => s.section))]);
    setSessions([...new Set(initialStudents.map((s) => s.session))]);
  }, []);

  // Load students when dropdowns are selected
  useEffect(() => {
    if (!classSel || !sectionSel || !sessionSel) return;
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = initialStudents
      .filter(
        (s) =>
          s.class === classSel &&
          s.section === sectionSel &&
          s.session === sessionSel
      )
      .map((s) => {
        const f = saved.find((x) => x.id === s.id);
        return f ? { ...s, rfid: f.rfid } : s;
      });
    setStudents(filtered);
    setSelectedStudent(null);
  }, [classSel, sectionSel, sessionSel]);

  // Auto focus on RFID input when dropdowns selected
  useEffect(() => {
    if (classSel && sectionSel && sessionSel) inputRef.current?.focus();
  }, [classSel, sectionSel, sessionSel]);

  // ================== Utility functions ==================
  const showStatus = (msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3000);
  };

  const saveToStorage = (arr) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  // Assign RFID logic
  const assignRfid = () => {
    if (!rfid.trim()) return showStatus("Scan RFID first", "error");

    if (students.some((s) => s.rfid === rfid.trim())) {
      setRfid("");
      inputRef.current?.focus();
      return showStatus("RFID already used", "error");
    }

    if (selectedStudent) {
      const updated = students.map((s) =>
        s.id === selectedStudent.id ? { ...s, rfid: rfid.trim() } : s
      );
      setStudents(updated);
      saveToStorage(updated);
      setRfid("");
      setSelectedStudent(null);
      showStatus(`RFID assigned to ${selectedStudent.name}`, "success");
      inputRef.current?.focus();
      return;
    }

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
    setRfid("");
    showStatus(`RFID assigned to ${updated[idx].name}`, "success");
    inputRef.current?.focus();
  };

  // Remove RFID from student
  const handleRemove = (id) => {
    const student = students.find((s) => s.id === id);
    const updated = students.map((s) => (s.id === id ? { ...s, rfid: "" } : s));
    setStudents(updated);
    saveToStorage(updated);
    showStatus(`RFID removed from ${student.name}`, "success");
    inputRef.current?.focus();
  };

  // Select student by search term
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

  // Select student by double clicking row
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
      {/* Status message popup */}
      {status && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
            status.type === "success" ? "bg-green-800" : "bg-red-800"
          }`}
        >
          <div className="text-xl">
            {status.type === "success" ? (
              <FaCheckCircle />
            ) : (
              <FaExclamationTriangle />
            )}
          </div>
          <p>{status.msg}</p>
          <button onClick={() => setStatus(null)} className="ml-2">
            <FaTimes />
          </button>
        </div>
      )}

      {/* FiltersBar Component */}
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

      {classSel && sectionSel && sessionSel && (
        <>
          {/* SearchAndInput Component */}
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

          {/* SelectedStudentCard Component */}
          {selectedStudent && (
            <SelectedStudentCard
              student={selectedStudent}
              clear={() => {
                setSelectedStudent(null);
                inputRef.current?.focus();
              }}
            />
          )}

          {/* Info line */}
          <div className="max-w-6xl mx-auto mb-3">
            <p className="text-sm text-gray-400">
              Showing {filtered.length} of {students.length} students
              {searchTerm && ` matching "${searchTerm}"`} | Double-click to
              select
            </p>
          </div>

          {/* StudentsTable Component */}
          <StudentsTable
            students={filtered}
            selectedStudent={selectedStudent}
            handleRowDoubleClick={handleRowDoubleClick}
            handleRemove={handleRemove}
          />
        </>
      )}
    </div>
  );
}
