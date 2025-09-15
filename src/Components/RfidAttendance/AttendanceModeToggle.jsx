import { FaSignInAlt, FaSignOutAlt, FaClock } from "react-icons/fa";

export default function AttendanceModeToggle({ mode, onModeChange }) {
  const getModeDetails = (mode) => {
    switch(mode) {
      case "in": return { color: "bg-green-600", icon: <FaSignInAlt />, text: "IN MODE" };
      case "late": return { color: "bg-yellow-600", icon: <FaClock />, text: "LATE MODE" };
      case "out": return { color: "bg-red-600", icon: <FaSignOutAlt />, text: "OUT MODE" };
      default: return { color: "bg-green-600", icon: <FaSignInAlt />, text: "IN MODE" };
    }
  };

  const modeDetails = getModeDetails(mode);

  return (
    <div className="absolute top-4 right-6">
      <button
        onClick={onModeChange}
        className={`px-4 py-2 rounded-lg font-semibold ${modeDetails.color} text-white flex items-center gap-2`}
      >
        {modeDetails.icon}
        <span>Mode: {modeDetails.text}</span>
      </button>
    </div>
  );
}