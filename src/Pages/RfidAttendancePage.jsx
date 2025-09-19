import { useEffect, useRef, useState } from "react";
import AttendanceCard from "../Components/RfidAttendance/AttendanceCard";
import LoadingSpinner from "../Components/RfidAttendance/LoadingSpinner";
import RfidInput from "../Components/RfidAttendance/RfidInput";
import ClassModeController from "../Components/RfidAttendance/ClassModeController";
import { loadData } from "../utils/storage";

const STORAGE_KEY = "holidaysData";
const SCHEDULE_STORAGE_KEY = "attendanceSchedule";
const RFID_STORAGE_KEY = "rfidSimpleAssignments";
const INITIAL_STUDENTS = [
  { id: "1", name: "Alice", roll: "01", adm: "ADM001", class: "I", section: "A", session: "2025-2026", rfid: "" },
  { id: "2", name: "Charlie", roll: "02", adm: "ADM002", class: "I", section: "B", session: "2025-2026", rfid: "" },
  { id: "1", name: "Bob", roll: "01", adm: "ADM003", class: "II", section: "A", session: "2025-2026", rfid: "" },
  { id: "2", name: "Rohan", roll: "02", adm: "ADM004", class: "II", section: "B", session: "2025-2026", rfid: "" },
  { id: "1", name: "Sujoy", roll: "01", adm: "ADM005", class: "III", section: "A", session: "2025-2026", rfid: "" },
  { id: "2", name: "Arjun", roll: "02", adm: "ADM006", class: "III", section: "B", session: "2025-2026", rfid: "" },
];

const getUniqueId = (s) => `${s.class}-${s.section}-${s.id}`;

export default function RfidAttendancePage() {
  const [rfid, setRfid] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [activeStudents, setActiveStudents] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [todayTimeSchedules, setTodayTimeSchedules] = useState([]);
  const [classModes, setClassModes] = useState({});
  const [manualOverrides, setManualOverrides] = useState({});
  const [selectedClass, setSelectedClass] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [scheduledClasses, setScheduledClasses] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().slice(0, 5));

  useEffect(() => {
    inputRef.current?.focus();
  }, [attendance]);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toTimeString().slice(0, 5));
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const holidayData = loadData(STORAGE_KEY) || [];
    const activeHolidays = holidayData.filter(h => h.active);
    setHolidays(activeHolidays);
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const isTodayHoliday = activeHolidays.some(holiday => {
      const startDate = new Date(holiday.start);
      const endDate = new Date(holiday.end);
      return today >= startDate && today <= endDate;
    });
    
    setIsHoliday(isTodayHoliday);
    loadStudentData();
    loadTodaysTimeSchedules(todayStr);
    loadAttendanceRecords();
  }, []);

  // Real-time mode updates
  useEffect(() => {
    updateModesAutomatically();
  }, [currentTime, todayTimeSchedules, manualOverrides, isHoliday]);

  const updateModesAutomatically = () => {
    if (isHoliday || todayTimeSchedules.length === 0) return;

    const newModes = {};
    
    todayTimeSchedules.forEach(schedule => {
      if (manualOverrides[schedule.className]) return;
      
      let mode = "out";
      
      if (schedule.inStart && schedule.inEnd) {
        if (currentTime >= schedule.inStart && currentTime <= schedule.inEnd) {
          mode = "in";
        } else if (schedule.outStart && schedule.outEnd) {
          if (currentTime >= schedule.outStart && currentTime <= schedule.outEnd) {
            mode = "out";
          } else if (currentTime > schedule.inEnd && currentTime < schedule.outStart) {
            mode = "late";
          }
        }
      }
      
      newModes[schedule.className] = mode;
    });
    
    setClassModes(newModes);
  };

  const loadStudentData = () => {
    try {
      const rfidData = loadData(RFID_STORAGE_KEY, []);
      
      if (rfidData.length > 0) {
        const studentsFromRfid = INITIAL_STUDENTS.map(student => {
          const uniqueId = getUniqueId(student);
          const rfidAssignment = rfidData.find(item => item.uid === uniqueId);
          return {
            ...student,
            rfid: rfidAssignment ? rfidAssignment.rfid : ""
          };
        }).filter(student => student.rfid);
        
        setAllStudents(studentsFromRfid);
      } else {
        setAllStudents(INITIAL_STUDENTS);
      }
    } catch (error) {
      console.error("Error loading student data:", error);
      setAllStudents(INITIAL_STUDENTS);
    }
  };

  const loadTodaysTimeSchedules = (todayStr) => {
    try {
      const scheduleData = loadData(SCHEDULE_STORAGE_KEY) || [];
      const todaySchedules = scheduleData.filter(item => item.date === todayStr);
      
      if (todaySchedules.length > 0) {
        setTodayTimeSchedules(todaySchedules);
        
        const classes = [...new Set(todaySchedules.map(s => s.className))];
        setScheduledClasses(classes);
        
        if (classes.length > 0 && !selectedClass) {
          setSelectedClass(classes[0]);
        }
      } else {
        setTodayTimeSchedules([]);
        setScheduledClasses([]);
      }
    } catch (error) {
      console.error("Error loading time schedule:", error);
      setTodayTimeSchedules([]);
      setScheduledClasses([]);
    }
  };

  const loadAttendanceRecords = () => {
    try {
      const records = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
      const today = new Date().toISOString().split('T')[0];
      
      const todayRecords = {};
      records.forEach(record => {
        const recordDate = new Date(record.time).toISOString().split('T')[0];
        if (recordDate === today) {
          todayRecords[record.rfid] = todayRecords[record.rfid] || [];
          todayRecords[record.rfid].push(record);
        }
      });
      
      setAttendanceRecords(todayRecords);
      
      const activeStatus = {};
      Object.keys(todayRecords).forEach(rfid => {
        const lastRecord = todayRecords[rfid][todayRecords[rfid].length - 1];
        activeStatus[rfid] = lastRecord.status === "in" || lastRecord.status === "late";
      });
      
      setActiveStudents(activeStatus);
    } catch (error) {
      console.error("Error loading attendance records:", error);
    }
  };

  const handleScan = async (e) => {
    if (e.key !== "Enter" || !rfid.trim()) return;
    
    if (isHoliday) {
      setAttendance({ success: false, message: "Today is a holiday - Attendance not allowed" });
      setRfid("");
      return;
    }
    
    if (scheduledClasses.length === 0) {
      setAttendance({ success: false, message: "No classes scheduled for today" });
      setRfid("");
      return;
    }
    
    setLoading(true);
    setAttendance(null);

    try {
      const rfidStudent = findStudentByRfid(rfid);
      
      if (!rfidStudent) {
        setAttendance({ success: false, message: "RFID not assigned to any student" });
        setLoading(false);
        setRfid("");
        return;
      }

      const student = getStudentDetails(rfidStudent);
      
      if (!scheduledClasses.includes(student.class)) {
        setAttendance({ 
          success: false, 
          message: `Class ${student.class} not scheduled for today` 
        });
        setLoading(false);
        setRfid("");
        return;
      }

      const classSchedule = todayTimeSchedules.find(s => s.className === student.class);
      const mode = classModes[student.class] || "in";
      
      const isIn = activeStudents[rfid.trim()] || false;
      const attendanceHistory = getStudentAttendanceHistory(rfid.trim());
      
      let statusMessage = "";
      let status = "";
      let isAllowed = true;

      const now = new Date();

      if (classSchedule) {
        if (mode === "in" || mode === "late") {
          if (classSchedule.inStart && classSchedule.inEnd) {
            isAllowed = currentTime >= classSchedule.inStart && currentTime <= classSchedule.inEnd;
            if (!isAllowed && mode === "late") {
              isAllowed = currentTime > classSchedule.inEnd;
            }
          }
        } else if (mode === "out") {
          if (classSchedule.outStart && classSchedule.outEnd) {
            isAllowed = currentTime >= classSchedule.outStart && currentTime <= classSchedule.outEnd;
          }
        }
      }

      if (!isAllowed) {
        status = "error";
        statusMessage = `Attendance not allowed at this time. Current time: ${currentTime}`;
      } else if (mode === "in" || mode === "late") {
        if (isIn) {
          status = "error";
          statusMessage = `${student.name} is already inside. Cannot check in again.`;
        } else {
          status = mode === "late" ? "late" : "in";
          statusMessage = mode === "late" 
            ? `Late entry recorded for ${student.name} (Class ${student.class})`
            : `Welcome ${student.name}! Check-in successful for Class ${student.class}`;
          setActiveStudents(prev => ({ ...prev, [rfid.trim()]: true }));
        }
      } else if (mode === "out") {
        if (!isIn) {
          status = "error";
          statusMessage = `${student.name} is not inside. Cannot check out.`;
        } else {
          status = "out";
          statusMessage = `Goodbye ${student.name}! Check-out successful from Class ${student.class}`;
          setActiveStudents(prev => ({ ...prev, [rfid.trim()]: false }));
        }
      }

      if (status === "error") {
        setAttendance({ success: false, message: statusMessage });
      } else {
        const time = now.toISOString();
        const attendanceData = { 
          success: true, 
          student, 
          status, 
          time, 
          message: statusMessage,
          scheduleInfo: classSchedule,
          modeType: manualOverrides[student.class] ? "manual" : "auto",
          currentTime: currentTime,
          attendanceHistory: attendanceHistory
        };
        
        setAttendance(attendanceData);
        
        const records = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
        records.push({ 
          rfid: rfid.trim(), 
          student, 
          status, 
          time, 
          message: statusMessage,
          mode: mode,
          schedule: classSchedule,
          modeType: manualOverrides[student.class] ? "manual" : "auto",
          currentTime: currentTime
        });
        localStorage.setItem("attendanceRecords", JSON.stringify(records));
        
        setAttendanceRecords(prev => ({
          ...prev,
          [rfid.trim()]: [...(prev[rfid.trim()] || []), {
            rfid: rfid.trim(),
            student,
            status,
            time,
            message: statusMessage
          }]
        }));
      }
    } catch (err) {
      setAttendance({ success: false, message: "Local storage error" });
    } finally {
      setLoading(false);
      setRfid("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const findStudentByRfid = (rfid) => {
    return allStudents.find(student => student.rfid === rfid.trim());
  };

  const getStudentDetails = (student) => {
    return {
      name: student.name,
      roll: student.roll,
      class: student.class,
      id: student.id,
      section: student.section,
      adm: student.adm
    };
  };

  const getStudentAttendanceHistory = (rfid) => {
    return attendanceRecords[rfid] || [];
  };

  const handleModeChange = (className, newMode) => {
    setManualOverrides(prev => ({ ...prev, [className]: true }));
    setClassModes(prev => ({ ...prev, [className]: newMode }));
  };

  const handleClassChange = (className) => {
    setSelectedClass(className);
  };

  const resetToAutoMode = (className) => {
    setManualOverrides(prev => ({ ...prev, [className]: false }));
    updateModesAutomatically();
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
        <div className="absolute top-4 left-24 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold z-10">
          🎉 Today is a Holiday!
        </div>
      )}
      
      {scheduledClasses.length === 0 && !isHoliday && (
        <div className="absolute top-4 left-24 bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold z-10">
          ⚠️ No classes scheduled today
        </div>
      )}
      
      <LoadingSpinner loading={loading} />
      <AttendanceCard 
        attendance={attendance} 
        classModes={classModes} 
        activeStudents={activeStudents}
        currentTime={currentTime}
      />
      
      {scheduledClasses.length > 0 && (
        <ClassModeController
          classSchedules={todayTimeSchedules}
          classModes={classModes}
          manualOverrides={manualOverrides}
          selectedClass={selectedClass}
          onClassChange={handleClassChange}
          onModeChange={handleModeChange}
          onResetToAuto={resetToAutoMode}
          currentTime={currentTime}
        />
      )}

      <RfidInput
        rfid={rfid} 
        setRfid={setRfid} 
        onScan={handleScan} 
        inputRef={inputRef} 
        disabled={isHoliday || scheduledClasses.length === 0}
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