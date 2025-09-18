import { useEffect, useRef, useState } from "react";
import { getAttendanceStatus, getCurrentMode, getTodaySchedule } from "../Components/RfidAttendance/AttendanceUtils";
import AttendanceCard from "../Components/RfidAttendance/AttendanceCard";
import LoadingSpinner from "../Components/RfidAttendance/LoadingSpinner";
import AttendanceModeToggle from "../Components/RfidAttendance/AttendanceModeToggle";
import RfidInput from "../Components/RfidAttendance/RfidInput";
import { loadData } from "../utils/storage";

const STORAGE_KEY = "holidaysData";

export default function RfidAttendancePage() {
  const [rfid, setRfid] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [activeStudents, setActiveStudents] = useState({});
  const [mode, setMode] = useState("in");
  const [todaySchedule, setTodaySchedule] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [isHoliday, setIsHoliday] = useState(false);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [attendance, mode]);

  // Load today's schedule, set mode, and check for holidays
  useEffect(() => {
    const schedule = getTodaySchedule();
    setTodaySchedule(schedule);
    const currentMode = getCurrentMode(schedule);
    setMode(currentMode);
    
    // Load holidays data
    const holidayData = loadData(STORAGE_KEY) || [];
    const activeHolidays = holidayData.filter(h => h.active);
    setHolidays(activeHolidays);
    
    // Check if today is a holiday
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const isTodayHoliday = activeHolidays.some(holiday => {
      const startDate = new Date(holiday.start);
      const endDate = new Date(holiday.end);
      return today >= startDate && today <= endDate;
    });
    
    setIsHoliday(isTodayHoliday);
  }, []);

  const handleModeChange = () => {
    if (isHoliday) {
      setAttendance({ 
        success: false, 
        message: "Cannot change mode on a holiday" 
      });
      return;
    }
    
    // Cycle through modes: in -> late -> out -> in
    const modes = ["in", "late", "out"];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
    
    setAttendance({ 
      success: true, 
      message: `Mode changed to ${modes[nextIndex].toUpperCase()}` 
    });
  };

  const handleScan = async (e) => {
    if (e.key !== "Enter" || !rfid.trim()) return;
    
    // Check if today is a holiday
    if (isHoliday) {
      setAttendance({ 
        success: false, 
        message: "Today is a holiday - Attendance not allowed" 
      });
      setRfid("");
      return;
    }
    
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
      {isHoliday && (
        <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
          🎉 Today is a Holiday!
        </div>
      )}
      
      <LoadingSpinner loading={loading} />
      <AttendanceCard attendance={attendance} />
      
      <AttendanceModeToggle mode={mode} onModeChange={handleModeChange} />

      <RfidInput
        rfid={rfid} 
        setRfid={setRfid} 
        onScan={handleScan} 
        inputRef={inputRef} 
        disabled={isHoliday}
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