// pages/RfidAttendanceReport.jsx
import { useState, useEffect } from "react";

export default function AttendanceReportPage() {
  const [filters, setFilters] = useState({ dateFrom:"", dateTo:"", session:"", class:"", section:"" });
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // Load session/class/section
  useEffect(() => {
    const savedStudents = JSON.parse(localStorage.getItem("rfidSimpleAssignments") || "[]");
    setSessions([...new Set(savedStudents.map(s => s.session))]);
    setClasses([...new Set(savedStudents.map(s => s.class))]);
    setSections([...new Set(savedStudents.map(s => s.section))]);
  }, []);

 

  const handleChange = (e) => setFilters({...filters, [e.target.name]: e.target.value});

  const fetchReport = () => {
    setLoading(true); setShowTable(false);

    setTimeout(() => {
      const students = JSON.parse(localStorage.getItem("rfidSimpleAssignments") || "[]");
      const logs = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");

      // Map all assigned students
      let reportData = students.map(s => {
        const logIn = logs.find(l => l.rfid === s.rfid && l.status === "in");
        const logOut = logs.find(l => l.rfid === s.rfid && l.status === "out");
        return {
          name: s.name || "—",
          class: s.class || "—",
          section: s.section || "—",
          roll: s.roll || "—",
          rfid: s.rfid || "—",
          inTime: logIn?.time || null,
          outTime: logOut?.time || null,
          status: logIn ? "present" : "absent",
          session: s.session || "—",
        };
      });

      // Apply filters
      if(filters.session) reportData = reportData.filter(r => String(r.session)===String(filters.session));
      if(filters.class) reportData = reportData.filter(r => r.class===filters.class);
      if(filters.section) reportData = reportData.filter(r => r.section===filters.section);
      if(filters.dateFrom){ const df = new Date(filters.dateFrom); reportData = reportData.filter(r => r.inTime && new Date(r.inTime)>=df);}
      if(filters.dateTo){ const dt = new Date(filters.dateTo); dt.setHours(23,59,59,999); reportData = reportData.filter(r => r.inTime && new Date(r.inTime)<=dt);}

      setReport(reportData);
      setLoading(false);
      setShowTable(true);
    }, 300);
  };

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Student Name,Class,Section,Roll,In Time,Out Time,Status"]
      .concat(report.map(r => `${r.name},${r.class},${r.section},${r.roll},${r.inTime||""},${r.outTime||""},${r.status}`))
      .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
    

      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 p-6 rounded shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">Attendance Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-gray-100" placeholder="Date From" />
            <input type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-gray-100" placeholder="Date To" />
            <select name="session" value={filters.session} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-gray-100">
              <option value="">All Sessions</option>
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select name="class" value={filters.class} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-gray-100">
              <option value="">All Classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select name="section" value={filters.section} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-gray-100">
              <option value="">All Sections</option>
              {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button onClick={fetchReport} className="px-4 py-2 bg-blue-600 rounded">{loading ? "Loading..." : "Generate Report"}</button>
            {report.length>0 && <button onClick={exportReport} className="px-4 py-2 bg-green-600 rounded">Export CSV</button>}
          </div>
        </div>

        {showTable && (
          <div className="bg-gray-800 rounded shadow overflow-x-auto">
            {report.length===0 ? <div className="p-6 text-center text-gray-400">No records found</div> : (
              <table className="w-full table-auto text-left border border-gray-700">
                <thead className="bg-gray-700 text-gray-100">
                  <tr>
                    <th className="p-2 border-r border-gray-600">#</th>
                    <th className="p-2 border-r border-gray-600">Student Name</th>
                    <th className="p-2 border-r border-gray-600">Class</th>
                    <th className="p-2 border-r border-gray-600">Section</th>
                    <th className="p-2 border-r border-gray-600">Roll</th>
                    <th className="p-2 border-r border-gray-600">In Time</th>
                    <th className="p-2 border-r border-gray-600">Out Time</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((r,i) => (
                    <tr key={i} className={`border-t border-gray-700 ${i%2===0?"bg-gray-900":"bg-gray-800"}`}>
                      <td className="p-2">{i+1}</td>
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{r.class}</td>
                      <td className="p-2">{r.section}</td>
                      <td className="p-2">{r.roll}</td>
                      <td className="p-2">{r.inTime ? new Date(r.inTime).toLocaleString() : "—"}</td>
                      <td className="p-2">{r.outTime ? new Date(r.outTime).toLocaleString() : "—"}</td>
                      <td className={`p-2 font-semibold ${r.status==="present"?"text-green-400":"text-red-500"}`}>{r.status==="present"?"Present":"Absent"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
