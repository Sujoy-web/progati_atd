import { FaSync, FaRobot, FaHandPointer } from "react-icons/fa";

export default function ClassModeController({
  classSchedules,
  classModes,
  manualOverrides,
  selectedClass,
  onClassChange,
  onModeChange,
  onResetToAuto,
  currentTime
}) {
  const getModeColor = (mode) => {
    switch(mode) {
      case "in": return "bg-green-600";
      case "late": return "bg-yellow-600";
      case "out": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  const getModeIcon = (mode) => {
    switch(mode) {
      case "in": return "🔒 IN";
      case "late": return "⏰ LATE";
      case "out": return "🚪 OUT";
      default: return "❓ UNKNOWN";
    }
  };

  const calculateCurrentMode = (schedule) => {
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

    return mode;
  };

  return (
    <div className="absolute top-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md z-10">
      <h3 className="font-bold text-lg mb-3 border-b border-gray-600 pb-2">
        Class Attendance Control
      </h3>
      
      {classSchedules.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {classSchedules.map(schedule => (
            <div key={schedule.className} className="p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="classSelection"
                    checked={selectedClass === schedule.className}
                    onChange={() => onClassChange(schedule.className)}
                    className="mr-2"
                  />
                  <span className="font-semibold">Class {schedule.className}</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getModeColor(classModes[schedule.className])}`}>
                    {getModeIcon(classModes[schedule.className])}
                  </span>
                  
                  {manualOverrides[schedule.className] && (
                    <button
                      onClick={() => onResetToAuto(schedule.className)}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                      title="Reset to automatic mode"
                    >
                      <FaSync className="mr-1" />
                      Auto
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-300 mb-2 grid grid-cols-2 gap-1">
                <div className="col-span-2 font-semibold mb-1">Schedule:</div>
                <div>In: {schedule.inStart || "Not set"}</div>
                <div>To: {schedule.inEnd || "Not set"}</div>
                <div>Out: {schedule.outStart || "Not set"}</div>
                <div>To: {schedule.outEnd || "Not set"}</div>
                <div className="col-span-2 mt-1">
                  Current Time: {currentTime}
                </div>
                <div className="col-span-2">
                  Auto Mode: {calculateCurrentMode(schedule).toUpperCase()}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-400 flex items-center">
                  {manualOverrides[schedule.className] ? (
                    <span className="text-yellow-400 flex items-center">
                      <FaHandPointer className="mr-1" /> Manual
                    </span>
                  ) : (
                    <span className="text-blue-400 flex items-center">
                      <FaRobot className="mr-1" /> Auto
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-1">
                  {["in", "late", "out"].map(mode => (
                    <button
                      key={mode}
                      onClick={() => onModeChange(schedule.className, mode)}
                      className={`px-2 py-1 text-xs rounded ${
                        classModes[schedule.className] === mode
                          ? getModeColor(mode)
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-yellow-500 text-sm">
          No class schedules found. Please set up class schedules first.
        </div>
      )}
    </div>
  );
}