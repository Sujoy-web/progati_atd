import { FaCheckCircle, FaSignOutAlt, FaExclamationTriangle } from "react-icons/fa";

export default function AttendanceCard({ attendance }) {
  if (!attendance) return null;
  
  if (!attendance.success) {
    return (
      <div className="absolute top-6 z-50 bg-red-500 p-6 rounded text-white">
        {attendance.message}
      </div>
    );
  }

  const { student, status, time, message } = attendance;
  const dateStr = new Date(time).toLocaleString();
  
  let icon, cardColor;
  if (status === "out") {
    icon = <FaSignOutAlt className="text-blue-600 text-3xl" />;
    cardColor = "border-blue-500";
  } else if (status === "error") {
    icon = <FaExclamationTriangle className="text-yellow-600 text-3xl" />;
    cardColor = "border-yellow-500";
  } else {
    icon = <FaCheckCircle className="text-green-600 text-3xl" />;
    cardColor = "border-green-500";
  }

  return (
    <div className={`absolute top-6 z-50 bg-white p-6 rounded-2xl shadow-lg border ${cardColor} max-w-xl mx-auto animate-fade-in`}>
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
          <p className="text-gray-500 text-sm">Roll: {student.roll} | Class: {student.class}</p>
          <p className="text-gray-500 text-xs">{dateStr}</p>
        </div>
        <div className="ml-auto">{icon}</div>
      </div>
      <div className="mt-2 text-lg font-semibold text-gray-800">{message}</div>
    </div>
  );
}