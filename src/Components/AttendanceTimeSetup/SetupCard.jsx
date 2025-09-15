// components/AttendanceTimeSetup/SetupCard.jsx
import ClassDropdown from "./ClassDropdown";
import RuleTable from "./RuleTable";

export default function SetupCard({
  setup,
  setupIndex,
  showClassDropdowns,
  availableClasses,
  weekDays,
  onToggleSetup,
  onUpdateSetupName,
  onDeleteSetup,
  onToggleClassDropdown,
  onToggleClass,
  onSelectAllClasses,
  onDeselectAllClasses,
  onDateChange,
  onGenerateRules,
  onRuleChange
}) {
  return (
    <div className="p-4 border border-gray-700 rounded mt-4 bg-gray-900">
      <div className="flex justify-between items-center mb-2">
        <input
          type="text"
          value={setup.name}
          onChange={(e) => onUpdateSetupName(setupIndex, e.target.value)}
          className="text-lg font-semibold bg-transparent border-b border-gray-600 focus:border-blue-500 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onToggleSetup(setupIndex)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          >
            {setup.expanded ? "Hide" : "Show"}
          </button>
          <button
            onClick={() => onDeleteSetup(setupIndex)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            title="Delete Setup"
          >
            🗑
          </button>
        </div>
      </div>

      {setup.expanded && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <ClassDropdown
              setup={setup}
              setupIndex={setupIndex}
              showDropdown={showClassDropdowns[setupIndex]}
              onToggleDropdown={onToggleClassDropdown}
              onToggleClass={onToggleClass}
              onSelectAll={onSelectAllClasses}
              onDeselectAll={onDeselectAllClasses}
              availableClasses={availableClasses}
            />

            <div>
              <label className="block text-sm font-medium mb-1">
                From Date
              </label>
              <input
                type="date"
                value={setup.fromDate}
                onChange={(e) =>
                  onDateChange(setupIndex, "fromDate", e.target.value)
                }
                className="p-2 border border-gray-600 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                To Date
              </label>
              <input
                type="date"
                value={setup.toDate}
                onChange={(e) =>
                  onDateChange(setupIndex, "toDate", e.target.value)
                }
                className="p-2 border border-gray-600 rounded bg-gray-700 text-white"
              />
            </div>

            <button
              onClick={() => onGenerateRules(setupIndex)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Generate Rules
            </button>
          </div>

          {setup.generated && (
            <RuleTable
              setup={setup}
              setupIndex={setupIndex}
              onRuleChange={onRuleChange}
              weekDays={weekDays}
            />
          )}
        </>
      )}
    </div>
  );
}