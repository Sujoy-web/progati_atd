import { useEffect, useRef, useState } from "react";
import { getAttendanceStatus, getCurrentMode, getTodaySchedule } from "../Components/RfidAttendance/AttendanceUtils";
import AttendanceCard from "../Components/RfidAttendance/AttendanceCard";
import LoadingSpinner from "../Components/RfidAttendance/LoadingSpinner";
import AttendanceModeToggle from "../Components/RfidAttendance/AttendanceModeToggle";
import RfidInput from "../Components/RfidAttendance/RfidInput";

export default function RfidAttendancePage() {
  const [rfid, setRfid] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [activeStudents, setActiveStudents] = useState({});
  const [mode, setMode] = useState("in");
  const [todaySchedule, setTodaySchedule] = useState({});

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [attendance, mode]);

  // Load today's schedule and set mode
  useEffect(() => {
    const schedule = getTodaySchedule();
    setTodaySchedule(schedule);
    const currentMode = getCurrentMode(schedule);
    setMode(currentMode);
  }, []);

  const handleModeChange = () => {
    // Cycle through modes: in -> late -> out -> in
    const modes = ["in", "late", "out"];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  const handleScan = async (e) => {
    if (e.key !== "Enter" || !rfid.trim()) return;
    setLoading(true);
    setAttendance(null);

    try {
      const students = JSON.parse(localStorage.getItem("rfidSimpleAssignments") || "[]");
      const student = students.find(s => s.rfid === rfid.trim());

      if (!student) {
        setAttendance({ success: false, message: "RFID not recognized" });
        setLoading(false);
        setRfid("");
        return;
      }

      const isIn = activeStudents[rfid.trim()] || false;
      let statusMessage = "";
      let status = "";

      const now = new Date();
      const attStatus = getAttendanceStatus(now.toISOString(), mode, todaySchedule);

      // Handle different modes
      if (mode === "in") {
        if (isIn) {
          status = "error";
          statusMessage = `${student.name} is already inside.`;
        } else {
          status = "in";
          statusMessage =
            attStatus === "ontime"
              ? `Welcome ${student.name}, you are on time!`
              : attStatus === "late"
              ? `Hello ${student.name}, you are late!`
              : `Hello ${student.name}, you came early!`;
          setActiveStudents(prev => ({ ...prev, [rfid.trim()]: true }));
        }
      } else if (mode === "late") {
        if (isIn) {
          status = "error";
          statusMessage = `${student.name} is already inside. Cannot mark late entry.`;
        } else {
          status = "in";
          statusMessage = `Late entry recorded for ${student.name}`;
          setActiveStudents(prev => ({ ...prev, [rfid.trim()]: true }));
        }
      } else if (mode === "out") {
        if (!isIn) {
          status = "error";
          statusMessage = `${student.name} is already outside.`;
        } else {
          status = "out";
          statusMessage =
            attStatus === "ontime"
              ? `Goodbye ${student.name}, leaving on time.`
              : attStatus === "late"
              ? `Goodbye ${student.name}, leaving late.`
              : `Goodbye ${student.name}, leaving early!`;
          setActiveStudents(prev => ({ ...prev, [rfid.trim()]: false }));
        }
      }

      if (status === "error") {
        setAttendance({ success: false, message: statusMessage });
      } else {
        const time = now.toISOString();
        setAttendance({ 
          success: true, 
          student, 
          status, 
          time, 
          message: statusMessage 
        });
        
        const records = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
        records.push({ 
          rfid: rfid.trim(), 
          student, 
          status, 
          time, 
          message: statusMessage,
          mode: mode,
          attendanceStatus: attStatus
        });
        localStorage.setItem("attendanceRecords", JSON.stringify(records));
      }
    } catch (err) {
      setAttendance({ success: false, message: "Local storage error" });
    } finally {
      setLoading(false);
      setRfid("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    if (attendance) {
      const timer = setTimeout(() => setAttendance(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [attendance]);

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-700 p-6 relative">
      <LoadingSpinner loading={loading} />
      <AttendanceCard attendance={attendance} />
      
      <AttendanceModeToggle mode={mode} onModeChange={handleModeChange} />

      <RfidInput
        rfid={rfid} 
        setRfid={setRfid} 
        onScan={handleScan} 
        inputRef={inputRef} 
      />

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}