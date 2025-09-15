// components/AttendanceTimeSetup/RuleTable.jsx
export default function RuleTable({ setup, setupIndex, onRuleChange, weekDays }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <h4 className="font-semibold mb-3 flex flex-wrap items-center gap-3 bg-blue-700 text-white p-3 rounded-lg shadow">
        <span className="text-sm sm:text-base">
          Weekly schedule for{" "}
          <span className="font-bold">
            {setup.selectedClasses.join(", ")}
          </span>
        </span>
        <span className="text-lg sm:text-xl font-bold">|</span>
        <span className="text-sm sm:text-base">
          From <span className="font-bold">{setup.fromDate}</span>
          <span className="mx-1">→</span>
          <span className="font-bold">{setup.toDate}</span>
        </span>
      </h4>

      <table className="table-auto border-collapse border border-gray-600 w-full">
        <thead>
          <tr className="bg-gray-700">
            <th className="border border-gray-600 px-4 py-2">Day</th>
            <th className="border border-gray-600 px-4 py-2">In From</th>
            <th className="border border-gray-600 px-4 py-2">In To</th>
            <th className="border border-gray-600 px-4 py-2">Out From</th>
            <th className="border border-gray-600 px-4 py-2">Out To</th>
            <th className="border border-gray-600 px-4 py-2">Off</th>
          </tr>
        </thead>
        <tbody>
          {setup.rules.map((row, idx) => (
            <tr
              key={row.day}
              className={row.isOff ? "bg-red-900" : "bg-gray-800"}
            >
              <td className="border border-gray-600 px-4 py-2">{row.day}</td>
              <td className="border border-gray-600 px-4 py-2">
                <input
                  type="time"
                  value={row.inStart}
                  disabled={row.isOff}
                  onChange={(e) =>
                    onRuleChange(setupIndex, idx, "inStart", e.target.value)
                  }
                  className="p-1 border border-gray-600 rounded bg-gray-700 text-white"
                />
              </td>
              <td className="border border-gray-600 px-4 py-2">
                <input
                  type="time"
                  value={row.inEnd}
                  disabled={row.isOff}
                  onChange={(e) =>
                    onRuleChange(setupIndex, idx, "inEnd", e.target.value)
                  }
                  className="p-1 border border-gray-600 rounded bg-gray-700 text-white"
                />
              </td>
              <td className="border border-gray-600 px-4 py-2">
                <input
                  type="time"
                  value={row.outStart}
                  disabled={row.isOff}
                  onChange={(e) =>
                    onRuleChange(setupIndex, idx, "outStart", e.target.value)
                  }
                  className="p-1 border border-gray-600 rounded bg-gray-700 text-white"
                />
              </td>
              <td className="border border-gray-600 px-4 py-2">
                <input
                  type="time"
                  value={row.outEnd}
                  disabled={row.isOff}
                  onChange={(e) =>
                    onRuleChange(setupIndex, idx, "outEnd", e.target.value)
                  }
                  className="p-1 border border-gray-600 rounded bg-gray-700 text-white"
                />
              </td>
              <td className="border border-gray-600 px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={row.isOff}
                  onChange={(e) =>
                    onRuleChange(setupIndex, idx, "isOff", e.target.checked)
                  }
                  className="rounded text-purple-600"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}