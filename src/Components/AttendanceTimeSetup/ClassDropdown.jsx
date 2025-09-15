// components/AttendanceTimeSetup/ClassDropdown.jsx
export default function ClassDropdown({
  setup,
  setupIndex,
  showDropdown,
  onToggleDropdown,
  onToggleClass,
  onSelectAll,
  onDeselectAll,
  availableClasses
}) {
  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">
        Choose Classes
      </label>
      <button
        onClick={() => onToggleDropdown(setupIndex)}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded w-full text-left flex justify-between items-center"
      >
        <span>
          {setup.selectedClasses.length === 0
            ? "Select Classes"
            : `${setup.selectedClasses.length} selected`}
        </span>
        <span>{showDropdown ? "▲" : "▼"}</span>
      </button>

      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded shadow-lg">
          <div className="p-2 border-b border-gray-600 flex justify-between">
            <button
              onClick={() => onSelectAll(setupIndex)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Select All
            </button>
            <button
              onClick={() => onDeselectAll(setupIndex)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Deselect All
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto p-2">
            {availableClasses.map((cls) => (
              <label
                key={cls}
                className="flex items-center gap-2 p-1 hover:bg-gray-600 rounded"
              >
                <input
                  type="checkbox"
                  checked={setup.selectedClasses.includes(cls)}
                  onChange={() => onToggleClass(setupIndex, cls)}
                  className="rounded text-purple-600"
                />
                <span>{cls}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}