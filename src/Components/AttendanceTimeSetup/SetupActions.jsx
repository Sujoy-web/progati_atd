// components/AttendanceTimeSetup/SetupActions.jsx
export default function SetupActions({ onAddSetup }) {
  return (
    <button
      onClick={onAddSetup}
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
    >
      + Add Setup
    </button>
  );
}