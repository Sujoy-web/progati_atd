// pages/AttendanceTimeSetup.jsx
import { useState, useEffect } from "react";
import SetupList from "../components/AttendanceTimeSetup/SetupList";
import FinalSchedule from "../components/AttendanceTimeSetup/FinalSchedule";
import SetupActions from "../components/AttendanceTimeSetup/SetupActions";
import { StatusMessage } from "../Components/YearPlanner/StatusMessage";
import { loadData, saveData } from "../utils/storage";

const STORAGE_KEY = "holidaysData";
const SCHEDULE_STORAGE_KEY = "attendanceSchedule";
const SETUPS_STORAGE_KEY = "attendanceSetups";
const RFID_STORAGE_KEY = "rfidSimpleAssignments"; // Key for RFID assignments

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function AttendanceTimeSetupPage() {
  const [setups, setSetups] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showClassDropdowns, setShowClassDropdowns] = useState({});
  const [searchDates, setSearchDates] = useState({});
  const [duplicatedRows, setDuplicatedRows] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]); // Load classes from storage

  // Load holidays, saved schedule, saved setups, and available classes from localStorage
  useEffect(() => {
    const holidayData = loadData(STORAGE_KEY) || [];
    setHolidays(holidayData.filter(h => h.active));
    
    // Load saved schedule if it exists
    const savedSchedule = loadData(SCHEDULE_STORAGE_KEY) || [];
    if (savedSchedule.length > 0) {
      setSchedule(savedSchedule);
      setShowSchedule(true);
    }
    
    // Load saved setups if they exist
    const savedSetups = loadData(SETUPS_STORAGE_KEY) || [];
    if (savedSetups.length > 0) {
      setSetups(savedSetups);
      showStatus("Loaded saved setups", "success");
    }

    // Load available classes from RFID storage
    loadAvailableClasses();
  }, []);

  // Load classes from RFID assignments storage
  const loadAvailableClasses = () => {
    const rfidData = loadData(RFID_STORAGE_KEY, []);
    
    // If we have RFID data, extract unique classes
    if (rfidData.length > 0) {
      const classesFromRfid = [...new Set(rfidData.map(item => {
        // Extract class from uid format: "class-section-id"
        const parts = item.uid.split('-');
        return parts[0]; // First part is the class
      }))].sort();
      
      setAvailableClasses(classesFromRfid);
      showStatus(`Loaded ${classesFromRfid.length} classes from RFID assignments`, "success");
    } else {
      // Fallback to initial students if no RFID data exists yet
      const initialStudents = [
        { id: "1", name: "Alice", roll: "01", adm: "ADM001", class: "I", section: "A", session: "2025-2026", rfid: "" },
        { id: "2", name: "Charlie", roll: "02", adm: "ADM002", class: "I", section: "B", session: "2025-2026", rfid: "" },
        { id: "1", name: "Bob", roll: "01", adm: "ADM003", class: "II", section: "A", session: "2025-2026", rfid: "" },
        { id: "2", name: "Rohan", roll: "02", adm: "ADM004", class: "II", section: "B", session: "2025-2026", rfid: "" },
        { id: "1", name: "Sujoy", roll: "01", adm: "ADM005", class: "III", section: "A", session: "2025-2026", rfid: "" },
        { id: "2", name: "Arjun", roll: "02", adm: "ADM006", class: "III", section: "B", session: "2025-2026", rfid: "" },
      ];
      
      const classesFromInitial = [...new Set(initialStudents.map(s => s.class))].sort();
      setAvailableClasses(classesFromInitial);
      showStatus(`Using default classes (no RFID data found)`, "info");
    }
  };

  // Save setups to localStorage whenever they change
  useEffect(() => {
    if (setups.length > 0) {
      saveData(SETUPS_STORAGE_KEY, setups);
    }
  }, [setups]);

  // Save schedule to localStorage whenever it changes
  useEffect(() => {
    if (schedule.length > 0) {
      saveData(SCHEDULE_STORAGE_KEY, schedule);
    }
  }, [schedule]);

  const showStatus = (msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3000);
  };

  const toggleClassDropdown = (setupIndex) => {
    setShowClassDropdowns((prev) => ({
      ...prev,
      [setupIndex]: !prev[setupIndex],
    }));
  };

  const addSetup = () => {
    setSetups((prev) => {
      const newSetups = [
        ...prev,
        {
          id: Date.now(),
          name: `Setup ${prev.length + 1}`,
          selectedClasses: [],
          fromDate: "",
          toDate: "",
          rules: [],
          generated: false,
          expanded: true,
        },
      ];
      return newSetups;
    });
    showStatus("New setup added", "success");
  };

  const updateSetupName = (setupIndex, name) => {
    setSetups((prev) => {
      const updated = [...prev];
      updated[setupIndex] = {
        ...updated[setupIndex],
        name,
      };
      return updated;
    });
  };

  const toggleSetup = (setupIndex) => {
    setSetups((prev) => {
      const updated = [...prev];
      updated[setupIndex] = {
        ...updated[setupIndex],
        expanded: !updated[setupIndex].expanded,
      };
      return updated;
    });
  };

  const toggleClass = (setupIndex, cls) => {
    setSetups((prev) => {
      const updated = [...prev];
      const current = { ...updated[setupIndex] };
      current.selectedClasses = current.selectedClasses.includes(cls)
        ? current.selectedClasses.filter((c) => c !== cls)
        : [...current.selectedClasses, cls];
      updated[setupIndex] = current;
      return updated;
    });
  };

  const selectAllClasses = (setupIndex) => {
    setSetups((prev) => {
      const updated = [...prev];
      updated[setupIndex] = {
        ...updated[setupIndex],
        selectedClasses: [...availableClasses],
      };
      return updated;
    });
    showStatus("All classes selected", "success");
  };

  const deselectAllClasses = (setupIndex) => {
    setSetups((prev) => {
      const updated = [...prev];
      updated[setupIndex] = {
        ...updated[setupIndex],
        selectedClasses: [],
      };
      return updated;
    });
    showStatus("All classes deselected", "success");
  };

  const handleSearchChange = (setupId, value) => {
    setSearchDates((prev) => ({
      ...prev,
      [setupId]: value,
    }));
  };

  const handleDateChange = (setupIndex, field, value) => {
    setSetups((prev) => {
      const updated = [...prev];
      updated[setupIndex] = { ...updated[setupIndex], [field]: value };
      return updated;
    });
  };

  const generateRules = (setupIndex) => {
    setSetups((prev) => {
      const updated = [...prev];
      const setup = { ...updated[setupIndex] };

      if (
        !setup.fromDate ||
        !setup.toDate ||
        setup.selectedClasses.length === 0
      ) {
        showStatus("Please select classes and dates first!", "error");
        return prev;
      }

      const newRules = weekDays.map((day) => ({
        day,
        inStart: "",
        inEnd: "",
        outStart: "",
        outEnd: "",
        isOff: false,
      }));

      setup.rules = newRules;
      setup.generated = true;
      updated[setupIndex] = setup;
      return updated;
    });
    showStatus("Rules generated successfully", "success");
  };

  const handleRuleChange = (setupIndex, dayIndex, field, value) => {
    setSetups((prev) => {
      const updated = [...prev];
      const setup = { ...updated[setupIndex] };
      const rules = [...setup.rules];
      const row = { ...rules[dayIndex], [field]: value };

      rules[dayIndex] = row;

      if (dayIndex === 0) {
        rules.forEach((r, i) => {
          if (i !== 0) r[field] = value;
        });
      }

      setup.rules = rules;
      updated[setupIndex] = setup;
      return updated;
    });
  };

  const duplicateDateForClass = (originalRow, className, setupId) => {
    const newRow = {
      ...originalRow,
      id: Date.now() + Math.random(),
      className: className,
      isDuplicated: true,
      originalDate: originalRow.date,
      setupId: setupId,
    };
    
    setSchedule(prev => [...prev, newRow]);
    
    setDuplicatedRows(prev => ({
      ...prev,
      [newRow.id]: true
    }));
    
    showStatus(`Date duplicated for ${className}`, "success");
  };

  const deleteDuplicatedRow = (id) => {
    setSchedule(prev => prev.filter(row => row.id !== id));
    setDuplicatedRows(prev => {
      const updated = {...prev};
      delete updated[id];
      return updated;
    });
    showStatus("Duplicated row deleted", "success");
  };

  const handleDuplicatedDateChange = (index, value) => {
    setSchedule(prev => {
      const updated = [...prev];
      updated[index] = { 
        ...updated[index], 
        date: value 
      };
      return updated;
    });
  };

  // Check if a date falls within any active holiday
  const isHoliday = (date) => {
    const currentDate = new Date(date);
    return holidays.some(holiday => {
      const startDate = new Date(holiday.start);
      const endDate = new Date(holiday.end);
      return currentDate >= startDate && currentDate <= endDate;
    });
  };

  const applyAll = () => {
    let finalSchedule = [];

    setups.forEach((setup) => {
      const { id, fromDate, toDate, selectedClasses, rules } = setup;
      if (
        !fromDate ||
        !toDate ||
        selectedClasses.length === 0 ||
        rules.length === 0
      )
        return;

      const start = new Date(fromDate);
      const end = new Date(toDate);

      selectedClasses.forEach((cls) => {
        let current = new Date(start);
        while (current <= end) {
          const dayName =
            weekDays[current.getDay() === 0 ? 6 : current.getDay() - 1];
          const rule = rules.find((r) => r.day === dayName);
          
          if (rule) {
            const dateStr = current.toISOString().split("T")[0];
            const isHolidayDate = isHoliday(dateStr);
            
            finalSchedule.push({
              id: Date.now() + Math.random(),
              className: cls,
              date: dateStr,
              day: dayName,
              ...rule,
              isOff: isHolidayDate || rule.isOff, // Mark as off if it's a holiday
              editable: true,
              setupId: id,
              isHoliday: isHolidayDate // Add flag to identify holiday dates
            });
          }
          current.setDate(current.getDate() + 1);
        }
      });
    });

    if (finalSchedule.length === 0) {
      showStatus("No valid schedule found. Please set rules first.", "error");
      return;
    }

    // Count holiday dates
    const holidayCount = finalSchedule.filter(item => item.isHoliday).length;
    
    setSchedule(finalSchedule);
    setShowSchedule(true);
    
    if (holidayCount > 0) {
      showStatus(`Final schedule generated with ${holidayCount} holiday dates automatically marked as off!`, "success");
    } else {
      showStatus("Final schedule generated!", "success");
    }
  };

  const handleScheduleTimeChange = (index, field, value) => {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const downloadExcel = () => {
    const headers = [
      "Class",
      "Date",
      "Day",
      "In From",
      "In To",
      "Out From",
      "Out To",
      "Off",
      "Holiday",
    ];
    const csvContent = [
      headers.join(","),
      ...schedule.map((row) =>
        [
          row.className,
          row.date,
          row.day,
          row.inStart,
          row.inEnd,
          row.outStart,
          row.outEnd,
          row.isOff ? "Yes" : "No",
          row.isHoliday ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance_schedule.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus("Schedule downloaded as CSV", "success");
  };

  // Clear all setups data
  const clearSetups = () => {
    if (window.confirm("Are you sure you want to clear all setups? This cannot be undone.")) {
      setSetups([]);
      saveData(SETUPS_STORAGE_KEY, []);
      showStatus("All setups cleared", "success");
    }
  };

  // Clear all schedule data
  const clearSchedule = () => {
    if (window.confirm("Are you sure you want to clear all schedule data? This cannot be undone.")) {
      setSchedule([]);
      setShowSchedule(false);
      saveData(SCHEDULE_STORAGE_KEY, []);
      showStatus("Schedule cleared", "success");
    }
  };

  // Clear everything
  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear ALL data (setups and schedule)? This cannot be undone.")) {
      setSetups([]);
      setSchedule([]);
      setShowSchedule(false);
      saveData(SETUPS_STORAGE_KEY, []);
      saveData(SCHEDULE_STORAGE_KEY, []);
      showStatus("All data cleared", "success");
    }
  };

  // Refresh classes from RFID storage
  const refreshClasses = () => {
    loadAvailableClasses();
    showStatus("Classes refreshed from RFID data", "success");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-800 text-white min-h-screen">
      <StatusMessage status={status} setStatus={setStatus} loading={loading} />
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Set Attendance Time & Rules</h2>
        <div className="flex gap-2">
          <button
            onClick={refreshClasses}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            title="Refresh classes from RFID assignments"
          >
            🔄 Refresh Classes
          </button>
          {setups.length > 0 && (
            <button
              onClick={clearSetups}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Clear Setups
            </button>
          )}
          {schedule.length > 0 && (
            <button
              onClick={clearSchedule}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Clear Schedule
            </button>
          )}
          {(setups.length > 0 || schedule.length > 0) && (
            <button
              onClick={clearAll}
              className="bg-red-800 hover:bg-red-900 text-white px-3 py-1 rounded text-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Class information */}
      <div className="bg-gray-700 p-3 rounded">
        <p className="text-sm">
          <strong>Available Classes:</strong> {availableClasses.length > 0 
            ? availableClasses.join(", ") 
            : "No classes found. Please add RFID assignments first."}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Classes are automatically loaded from RFID assignments storage
        </p>
      </div>

      <SetupActions onAddSetup={addSetup} />

      <SetupList
        setups={setups}
        showClassDropdowns={showClassDropdowns}
        availableClasses={availableClasses}
        weekDays={weekDays}
        onToggleSetup={toggleSetup}
        onUpdateSetupName={updateSetupName}
        onDeleteSetup={(setupIndex) => {
          setSetups((prev) => prev.filter((_, idx) => idx !== setupIndex));
          showStatus("Setup deleted", "success");
        }}
        onToggleClassDropdown={toggleClassDropdown}
        onToggleClass={toggleClass}
        onSelectAllClasses={selectAllClasses}
        onDeselectAllClasses={deselectAllClasses}
        onDateChange={handleDateChange}
        onGenerateRules={generateRules}
        onRuleChange={handleRuleChange}
      />

      {setups.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={applyAll}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            ✅ Generate Final Schedule
          </button>
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            {showSchedule ? "Hide Final Schedule" : "Show Final Schedule"}
          </button>
          {schedule.length > 0 && (
            <>
              <button
                onClick={downloadExcel}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                📥 Download as Excel
              </button>
            </>
          )}
        </div>
      )}

      {showSchedule && schedule.length > 0 && (
        <FinalSchedule
          setups={setups}
          schedule={schedule}
          searchDates={searchDates}
          duplicatedRows={duplicatedRows}
          onSearchChange={handleSearchChange}
          onScheduleTimeChange={handleScheduleTimeChange}
          onDuplicateDateForClass={duplicateDateForClass}
          onDeleteDuplicatedRow={deleteDuplicatedRow}
          onDuplicatedDateChange={handleDuplicatedDateChange}
          onDownloadExcel={downloadExcel}
        />
      )}
    </div>
  );
}

export default AttendanceTimeSetupPage;