// pages/RfidAttendanceReport.jsx
import { useState, useEffect } from "react";
import { FaDownload, FaFilter, FaSync, FaUser, FaGraduationCap, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// Helper function to get unique ID (same as in AssignPage)
const getUniqueId = (s) => `${s.class}-${s.section}-${s.id}`;

export default function AttendanceReportPage() {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    session: "",
    class: "",
    section: "",
    status: ""
  });
  
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });

  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // Load available filter options from localStorage
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = () => {
    try {
      // Load from RFID assignments storage (same as assign page)
      const rfidData = JSON.parse(localStorage.getItem("rfidSimpleAssignments") || "[]");
      
      // Load initial students structure
      const initialStudents = [
        { id: "1", name: "Alice", roll: "01", adm: "ADM001", class: "I", section: "A", session: "2025-2026", rfid: "" },
        { id: "2", name: "Charlie", roll: "02", adm: "ADM002", class: "I", section: "B", session: "2025-2026", rfid: "" },
        { id: "1", name: "Bob", roll: "01", adm: "ADM003", class: "II", section: "A", session: "2025-2026", rfid: "" },
        { id: "2", name: "Rohan", roll: "02", adm: "ADM004", class: "II", section: "B", session: "2025-2026", rfid: "" },
        { id: "1", name: "Sujoy", roll: "01", adm: "ADM005", class: "III", section: "A", session: "2025-2026", rfid: "" },
        { id: "2", name: "Arjun", roll: "02", adm: "ADM006", class: "III", section: "B", session: "2025-2026", rfid: "" },
      ];

      // If we have RFID data, map it to student structure
      let students = initialStudents;
      if (rfidData.length > 0) {
        students = initialStudents.map(student => {
          const uniqueId = getUniqueId(student);
          const rfidAssignment = rfidData.find(item => item.uid === uniqueId);
          return {
            ...student,
            rfid: rfidAssignment ? rfidAssignment.rfid : ""
          };
        });
      }

      // Extract unique values for filters
      setSessions([...new Set(students.map(s => s.session))].filter(Boolean));
      setClasses([...new Set(students.map(s => s.class))].filter(Boolean));
      setSections([...new Set(students.map(s => s.section))].filter(Boolean));

    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  };

  const handleChange = (e) => {
    setFilters({...filters, [e.target.name]: e.target.value});
  };

  const fetchReport = () => {
    setLoading(true);
    setShowTable(false);

    setTimeout(() => {
      try {
        // Load student data from the same storage as assign page
        const rfidData = JSON.parse(localStorage.getItem("rfidSimpleAssignments") || "[]");
        
        // Base student structure
        const initialStudents = [
          { id: "1", name: "Alice", roll: "01", adm: "ADM001", class: "I", section: "A", session: "2025-2026", rfid: "" },
          { id: "2", name: "Charlie", roll: "02", adm: "ADM002", class: "I", section: "B", session: "2025-2026", rfid: "" },
          { id: "1", name: "Bob", roll: "01", adm: "ADM003", class: "II", section: "A", session: "2025-2026", rfid: "" },
          { id: "2", name: "Rohan", roll: "02", adm: "ADM004", class: "II", section: "B", session: "2025-2026", rfid: "" },
          { id: "1", name: "Sujoy", roll: "01", adm: "ADM005", class: "III", section: "A", session: "2025-2026", rfid: "" },
          { id: "2", name: "Arjun", roll: "02", adm: "ADM006", class: "III", section: "B", session: "2025-2026", rfid: "" },
        ];

        // Map RFID data to students
        const studentData = initialStudents.map(student => {
          const uniqueId = getUniqueId(student);
          const rfidAssignment = rfidData.find(item => item.uid === uniqueId);
          return {
            ...student,
            rfid: rfidAssignment ? rfidAssignment.rfid : ""
          };
        });

        // Load attendance records
        const attendanceRecords = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");

        // Process report data
        let reportData = studentData.map(student => {
          // Filter records for this student by RFID
          const studentRecords = attendanceRecords.filter(record => 
            record.rfid === student.rfid
          );

          // Apply date filters
          let filteredRecords = studentRecords;
          if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            filteredRecords = filteredRecords.filter(record => 
              new Date(record.time) >= fromDate
            );
          }
          if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            filteredRecords = filteredRecords.filter(record => 
              new Date(record.time) <= toDate
            );
          }

          // Get latest in and out records
          const inRecord = filteredRecords
            .filter(record => record.status === "in" || record.status === "late")
            .sort((a, b) => new Date(b.time) - new Date(a.time))[0];

          const outRecord = filteredRecords
            .filter(record => record.status === "out")
            .sort((a, b) => new Date(b.time) - new Date(a.time))[0];

          return {
            name: student.name,
            class: student.class,
            section: student.section,
            roll: student.roll,
            adm: student.adm,
            rfid: student.rfid,
            session: student.session,
            inTime: inRecord?.time || null,
            outTime: outRecord?.time || null,
            status: inRecord ? "present" : "absent",
            records: filteredRecords
          };
        });

        // Apply additional filters
        if (filters.session) {
          reportData = reportData.filter(r => r.session === filters.session);
        }
        if (filters.class) {
          reportData = reportData.filter(r => r.class === filters.class);
        }
        if (filters.section) {
          reportData = reportData.filter(r => r.section === filters.section);
        }
        if (filters.status) {
          reportData = reportData.filter(r => r.status === filters.status);
        }

        // Calculate summary
        const total = reportData.length;
        const present = reportData.filter(r => r.status === "present").length;
        const absent = total - present;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        setReport(reportData);
        setSummary({ total, present, absent, percentage });
        setLoading(false);
        setShowTable(true);

      } catch (error) {
        console.error("Error generating report:", error);
        setLoading(false);
      }
    }, 500);
  };

  const exportReport = () => {
    const headers = ["Student Name", "Class", "Section", "Roll", "Admission No", "RFID", "In Time", "Out Time", "Status", "Session"];
    const csvContent = [
      headers.join(","),
      ...report.map(r => [
        r.name,
        r.class,
        r.section,
        r.roll,
        r.adm,
        r.rfid,
        r.inTime ? new Date(r.inTime).toLocaleString() : "",
        r.outTime ? new Date(r.outTime).toLocaleString() : "",
        r.status,
        r.session
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      session: "",
      class: "",
      section: "",
      status: ""
    });
    setShowTable(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Attendance Reports</h1>
          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center gap-2"
            >
              <FaSync /> Clear Filters
            </button>
            {report.length > 0 && (
              <button
                onClick={exportReport}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
              >
                <FaDownload /> Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-blue-400" />
            <h2 className="text-xl font-semibold">Filter Reports</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date From</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date To</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Session</label>
              <select
                name="session"
                value={filters.session}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Sessions</option>
                {sessions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <select
                name="class"
                value={filters.class}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <select
                name="section"
                value={filters.section}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Sections</option>
                {sections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Generating Report..." : "Generate Report"}
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          </button>
        </div>

        {/* Summary Cards */}
        {showTable && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{summary.total}</div>
              <div className="text-gray-400">Total Students</div>
            </div>
            
            <div className="bg-green-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{summary.present}</div>
              <div className="text-green-300">Present</div>
            </div>
            
            <div className="bg-red-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{summary.absent}</div>
              <div className="text-red-300">Absent</div>
            </div>
            
            <div className="bg-blue-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{summary.percentage}%</div>
              <div className="text-blue-300">Attendance Rate</div>
            </div>
          </div>
        )}

        {/* Results Table */}
        {showTable && (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {report.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FaTimesCircle className="text-4xl mx-auto mb-4 text-gray-600" />
                <p className="text-lg">No attendance records found matching your filters</p>
                <p className="text-sm">Try adjusting your filter criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Class Info</th>
                      <th className="px-4 py-3 text-left">In Time</th>
                      <th className="px-4 py-3 text-left">Out Time</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Session</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {report.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-750">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <FaUser className="text-sm" />
                            </div>
                            <div>
                              <div className="font-semibold">{r.name}</div>
                              <div className="text-sm text-gray-400">Roll: {r.roll}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FaGraduationCap className="text-gray-400" />
                            <span>Class {r.class}</span>
                            <span className="text-gray-400">|</span>
                            <span>Sec {r.section}</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">ADM: {r.adm}</div>
                        </td>
                        
                        <td className="px-4 py-3">
                          {r.inTime ? (
                            <div className="flex items-center gap-2">
                              <FaClock className="text-green-400" />
                              <span>{new Date(r.inTime).toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        
                        <td className="px-4 py-3">
                          {r.outTime ? (
                            <div className="flex items-center gap-2">
                              <FaClock className="text-red-400" />
                              <span>{new Date(r.outTime).toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                            r.status === "present" 
                              ? "bg-green-900 text-green-300" 
                              : "bg-red-900 text-red-300"
                          }`}>
                            {r.status === "present" ? (
                              <FaCheckCircle />
                            ) : (
                              <FaTimesCircle />
                            )}
                            {r.status.toUpperCase()}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className="text-gray-400">{r.session}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!showTable && (
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <div className="text-gray-400 mb-4">
              <FaFilter className="text-3xl mx-auto mb-3 text-blue-400" />
              <h3 className="text-lg font-semibold mb-2">Generate Attendance Reports</h3>
              <p className="text-sm">Select filters and click "Generate Report" to view attendance data</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}