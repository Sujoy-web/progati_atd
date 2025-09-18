// pages/AttendanceTimeSetup.jsx
import { useState } from "react";

import SetupList from "../components/AttendanceTimeSetup/SetupList";
import FinalSchedule from "../components/AttendanceTimeSetup/FinalSchedule";
import SetupActions from "../components/AttendanceTimeSetup/SetupActions";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const availableClasses = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
];

 function AttendanceTimeSetupPage() {
  const [setups, setSetups] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showClassDropdowns, setShowClassDropdowns] = useState({});
  const [searchDates, setSearchDates] = useState({});
  const [duplicatedRows, setDuplicatedRows] = useState({});

   const toggleClassDropdown = (setupIndex) => {
    setShowClassDropdowns((prev) => ({
      ...prev,
      [setupIndex]: !prev[setupIndex],
    }));
  };

  const addSetup = () => {
    setSetups((prev) => [
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
    ]);
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
        alert("Please select classes and dates first!");
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
  };

  const deleteDuplicatedRow = (id) => {
    setSchedule(prev => prev.filter(row => row.id !== id));
    setDuplicatedRows(prev => {
      const updated = {...prev};
      delete updated[id];
      return updated;
    });
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
            finalSchedule.push({
              id: Date.now() + Math.random(),
              className: cls,
              date: current.toISOString().split("T")[0],
              day: dayName,
              ...rule,
              editable: true,
              setupId: id,
            });
          }
          current.setDate(current.getDate() + 1);
        }
      });
    });

    if (finalSchedule.length === 0) {
      alert("No valid schedule found. Please set rules first.");
      return;
    }

    setSchedule(finalSchedule);
    setShowSchedule(true);
    alert("Final schedule generated! You can now customize individual dates.");
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
  };

  return (
    <div className="p-6 space-y-6 bg-gray-800 text-white min-h-screen">
      <h2 className="text-xl font-bold">Set Attendance Time & Rules</h2>

      {/* This should be the ONLY "Add Setup" button */}
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
            <button
              onClick={downloadExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              📥 Download as Excel
            </button>
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