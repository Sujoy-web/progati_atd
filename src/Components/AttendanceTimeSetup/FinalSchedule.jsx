// components/AttendanceTimeSetup/FinalSchedule.jsx
export default function FinalSchedule({
  setups,
  schedule,
  searchDates,
  duplicatedRows,
  onSearchChange,
  onScheduleTimeChange,
  onDuplicateDateForClass,
  onDeleteDuplicatedRow,
  onDuplicatedDateChange,
  onDownloadExcel
}) {
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Final Schedule Report</h3>
        <button
          onClick={onDownloadExcel}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          📥 Download Excel
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        You can customize individual date times below. Changes are saved
        automatically. (Applied to all selected classes.)
      </p>

      {setups.map((setup) => {
        const rows = schedule.filter(
          (row) => row.date >= setup.fromDate && row.date <= setup.toDate && row.setupId === setup.id
        );

        const searchTerm = searchDates[setup.id] || "";
        const filteredRows = searchTerm
          ? rows.filter(row => row.date.includes(searchTerm))
          : rows;

        const uniqueDates = Array.from(
          new Set(filteredRows
            .filter(row => !row.isDuplicated)
            .map((r) => r.date))
        );

        const duplicatedRowsForSetup = filteredRows.filter(row => 
          row.isDuplicated && row.setupId === setup.id
        );

        // Don't return null if no results - show the search header with a message
        return (
          <div
            key={setup.id}
            className="mb-6 bg-gray-900 p-4 rounded border border-gray-700"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h4 className="font-medium text-blue-400">
                Schedule for {setup.name} <br />
                From {setup.fromDate} To {setup.toDate} <br />
                Classes Applied: {setup.selectedClasses.join(", ")}
              </h4>
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search by date (YYYY-MM-DD)"
                  value={searchDates[setup.id] || ""}
                  onChange={(e) => onSearchChange(setup.id, e.target.value)}
                  className="p-2 pl-10 border border-gray-600 rounded bg-gray-700 text-white w-full md:w-64"
                />
                <svg 
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {/* Show message if no results found */}
            {uniqueDates.length === 0 && duplicatedRowsForSetup.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                No schedule entries found for your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-auto border-collapse border border-gray-600 w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="border border-gray-600 px-4 py-2">Date</th>
                      <th className="border border-gray-600 px-4 py-2">Day</th>
                      <th className="border border-gray-600 px-4 py-2">In From</th>
                      <th className="border border-gray-600 px-4 py-2">In To</th>
                      <th className="border border-gray-600 px-4 py-2">Out From</th>
                      <th className="border border-gray-600 px-4 py-2">Out To</th>
                      <th className="border border-gray-600 px-4 py-2">Off</th>
                      <th className="border border-gray-600 px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueDates.map((date) => {
                      const row = filteredRows.find(r => r.date === date && !r.isDuplicated);
                      if (!row) return null;
                      
                      const scheduleIndex = schedule.findIndex(
                        (item) => item.id === row.id
                      );

                      return (
                        <tr
                          key={row.id}
                          className={row.isOff ? "bg-red-900" : "bg-gray-800"}
                        >
                          <td className="border border-gray-600 px-4 py-2">
                            {row.date}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            {row.day}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            <input
                              type="time"
                              value={row.inStart}
                              disabled={row.isOff}
                              onChange={(e) =>
                                onScheduleTimeChange(
                                  scheduleIndex,
                                  "inStart",
                                  e.target.value
                                )
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
                                onScheduleTimeChange(
                                  scheduleIndex,
                                  "inEnd",
                                  e.target.value
                                )
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
                                onScheduleTimeChange(
                                  scheduleIndex,
                                  "outStart",
                                  e.target.value
                                )
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
                                onScheduleTimeChange(
                                  scheduleIndex,
                                  "outEnd",
                                  e.target.value
                                )
                              }
                              className="p-1 border border-gray-600 rounded bg-gray-700 text-white"
                            />
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={row.isOff}
                              onChange={(e) =>
                                onScheduleTimeChange(
                                  scheduleIndex,
                                  "isOff",
                                  e.target.checked
                                )
                              }
                              className="rounded text-purple-600"
                            />
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-center">
                            <select
                              onChange={(e) => {
                                const selectedClass = e.target.value;
                                if (selectedClass) {
                                  onDuplicateDateForClass(row, selectedClass, setup.id);
                                  e.target.value = "";
                                }
                              }}
                              className="p-1 bg-gray-700 text-white rounded text-sm w-full"
                            >
                              <option value="">Duplicate for class</option>
                              {setup.selectedClasses.map((cls, idx) => (
                                <option key={idx} value={cls}>
                                  {cls}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}

                    {duplicatedRowsForSetup.map((row) => {
                      const scheduleIndex = schedule.findIndex(
                        (item) => item.id === row.id
                      );

                      return (
                        <tr
                          key={row.id}
                          className="bg-blue-900"
                        >
                          <td className="border border-gray-600 px-4 py-2">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => onDuplicatedDateChange(scheduleIndex, e.target.value)}
                              className="p-1 border border-gray-600 rounded bg-blue-800 text-white"
                            />
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            {row.day}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            <input
                              type="time"
                              value={row.inStart}
                              disabled={row.isOff}
                              onChange={(e) =>
                                onScheduleTimeChange(
                                  scheduleIndex,
                                  "inStart",
                                  e.target.value
                                )
                              }
                              className="p-1 border border-gray-600 rounded bg-blue-800 text-white"
                            />
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            <input
                              type="time"
                              value={row.inEnd}
                              disabled={row.isOff}
                              onChange={(e) =>
                                onScheduleTimeChange(
                                  scheduleIndex,
                                  "inEnd",
                                  e.target.value
                                )
                              }
                              className="p-1 border border-gray-600 rounded bg-blue-800 text-white"
                            />
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            <input
                              type="time"
                              value={row.outStart}
                              disabled={row.isOff}
                              onChange={(e) =>
                                onScheduleTimeChange(
                                  scheduleIndex,
                                  "outStart",
                                  e.target.value
                                )
                              }
                              className="p-1 border border-gray-600 rounded bg-blue-800 text-white"
                            />
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            <input
                              type="time"
                              value={row.outEnd}
                              disabled={row.isOff}
                              onChange={(e) =>
                                onScheduleTimeChange(
                                  scheduleIndex,
                                  "outEnd",
                                  e.target.value
                                )
                              }
                              className="p-1 border border-gray-600 rounded bg-blue-800 text-white"
                            />
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={row.isOff}
                              onChange={(e) =>
                                onScheduleTimeChange(
                                  scheduleIndex,
                                  "isOff",
                                  e.target.checked
                                )
                              }
                              className="rounded text-purple-600"
                            />
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-center">
                            <div className="flex flex-col gap-2">
                              <div className="text-xs text-green-400 font-semibold">
                                For: {row.className}
                              </div>
                              <button
                                onClick={() => onDeleteDuplicatedRow(row.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}