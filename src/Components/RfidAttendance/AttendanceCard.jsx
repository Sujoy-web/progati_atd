import { FaCheckCircle, FaSignOutAlt, FaExclamationTriangle, FaClock, FaUser, FaIdCard, FaGraduationCap, FaHistory } from "react-icons/fa";

export default function AttendanceCard({ attendance, classModes, activeStudents, currentTime }) {
  if (!attendance) return null;
  
  if (!attendance.success) {
    return (
      <div className="absolute top-6 z-50 bg-red-500 p-6 rounded-lg text-white animate-fade-in shadow-xl">
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-xl" />
          <span className="font-semibold">{attendance.message}</span>
        </div>
      </div>
    );
  }

  const { student, status, time, message, scheduleInfo, modeType, attendanceHistory } = attendance;
  const date = new Date(time);
  const dateStr = date.toLocaleDateString();
  const timeStr = date.toLocaleTimeString();
  
  let icon, cardColor, borderColor, headerColor;
  if (status === "out") {
    icon = <FaSignOutAlt className="text-blue-600 text-3xl" />;
    cardColor = "bg-blue-50";
    borderColor = "border-blue-400";
    headerColor = "bg-blue-600";
  } else if (status === "error") {
    icon = <FaExclamationTriangle className="text-yellow-600 text-3xl" />;
    cardColor = "bg-yellow-50";
    borderColor = "border-yellow-400";
    headerColor = "bg-yellow-600";
  } else {
    icon = <FaCheckCircle className="text-green-600 text-3xl" />;
    cardColor = "bg-green-50";
    borderColor = "border-green-400";
    headerColor = "bg-green-600";
  }

  const currentClassMode = classModes[student.class] || "in";
  const isAllowed = (status === "in" || status === "late") && currentClassMode === "in" || 
                   status === "out" && currentClassMode === "out";

  return (
    <div className={`absolute top-6 z-50 ${cardColor} rounded-2xl shadow-xl border-2 ${borderColor} max-w-md mx-auto animate-fade-in overflow-hidden`}>
      <div className={`${headerColor} text-white p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-bold text-lg">
            {status === "in" || status === "late" ? "CHECK-IN SUCCESSFUL" : "CHECK-OUT SUCCESSFUL"}
          </span>
        </div>
        <div className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
          {modeType === "manual" ? "MANUAL MODE" : "AUTO MODE"}
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FaUser className="text-gray-500" />
            <div>
              <div className="text-xs text-gray-500">Name</div>
              <div className="font-semibold text-gray-900">{student.name}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FaIdCard className="text-gray-500" />
            <div>
              <div className="text-xs text-gray-500">Roll Number</div>
              <div className="font-semibold text-gray-900">{student.roll}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FaGraduationCap className="text-gray-500" />
            <div>
              <div className="text-xs text-gray-500">Class</div>
              <div className="font-semibold text-gray-900">{student.class}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FaClock className="text-gray-500" />
            <div>
              <div className="text-xs text-gray-500">ID</div>
              <div className="font-semibold text-gray-900">{student.id}</div>
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-lg mb-4 ${
          status === "out" ? "bg-blue-100 text-blue-800" : 
          status === "error" ? "bg-yellow-100 text-yellow-800" : 
          "bg-green-100 text-green-800"
        }`}>
          <div className="font-semibold text-center">{message}</div>
        </div>

        <div className="bg-gray-100 p-3 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">Date:</div>
            <div className="font-semibold">{dateStr}</div>
            
            <div className="text-gray-600">Time:</div>
            <div className="font-semibold">{timeStr}</div>
            
            <div className="text-gray-600">Current Time:</div>
            <div className="font-semibold">{currentTime}</div>
            
            <div className="text-gray-600">Status:</div>
            <div className="font-semibold">
              <span className={`px-2 py-1 rounded text-xs ${
                status === "out" ? "bg-blue-200 text-blue-800" : 
                status === "error" ? "bg-yellow-200 text-yellow-800" : 
                "bg-green-200 text-green-800"
              }`}>
                {status.toUpperCase()}
              </span>
            </div>
            
            <div className="text-gray-600">Class Mode:</div>
            <div className="font-semibold">
              <span className={`px-2 py-1 rounded text-xs ${
                currentClassMode === "out" ? "bg-red-200 text-red-800" : 
                currentClassMode === "late" ? "bg-yellow-200 text-yellow-800" : 
                "bg-green-200 text-green-800"
              }`}>
                {currentClassMode.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {scheduleInfo && (
          <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <FaClock className="text-blue-500" />
              <span className="font-semibold">Class Schedule:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-600">In Time:</div>
              <div className="font-semibold">{scheduleInfo.inStart || "Not set"}</div>
              
              <div className="text-gray-600">In Until:</div>
              <div className="font-semibold">{scheduleInfo.inEnd || "Not set"}</div>
              
              <div className="text-gray-600">Out Time:</div>
              <div className="font-semibold">{scheduleInfo.outStart || "Not set"}</div>
              
              <div className="text-gray-600">Out Until:</div>
              <div className="font-semibold">{scheduleInfo.outEnd || "Not set"}</div>
            </div>
          </div>
        )}

        {attendanceHistory && attendanceHistory.length > 0 && (
          <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <FaHistory className="text-purple-500" />
              <span className="font-semibold">Today's History:</span>
            </div>
            <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
              {attendanceHistory.slice(-3).map((record, index) => (
                <div key={index} className="flex justify-between">
                  <span>{new Date(record.time).toLocaleTimeString()}</span>
                  <span className={`px-1 rounded ${
                    record.status === "in" ? "bg-green-200 text-green-800" :
                    record.status === "out" ? "bg-blue-200 text-blue-800" :
                    "bg-yellow-200 text-yellow-800"
                  }`}>
                    {record.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`p-2 rounded-lg text-center text-sm font-semibold ${
          isAllowed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {isAllowed ? "✅ Attendance validated successfully" : "❌ Attendance not allowed in current mode"}
        </div>
      </div>
    </div>
  );
}