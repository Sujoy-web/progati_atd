export default function FiltersBar({
  classes,
  sections,
  sessions,
  classSel,
  sectionSel,
  sessionSel,
  filter,
  setClassSel,
  setSectionSel,
  setSessionSel,
  setFilter,
}) {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-4 gap-3 mb-5">
      <select value={classSel} onChange={(e) => setClassSel(e.target.value)} className="p-3 rounded-lg bg-gray-800 border border-gray-700">
        <option value="">Class</option>
        {classes.map((c) => <option key={c}>{c}</option>)}
      </select>
      <select value={sectionSel} onChange={(e) => setSectionSel(e.target.value)} className="p-3 rounded-lg bg-gray-800 border border-gray-700">
        <option value="">Section</option>
        {sections.map((s) => <option key={s}>{s}</option>)}
      </select>
      <select value={sessionSel} onChange={(e) => setSessionSel(e.target.value)} className="p-3 rounded-lg bg-gray-800 border border-gray-700">
        <option value="">Session</option>
        {sessions.map((s) => <option key={s}>{s}</option>)}
      </select>
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-3 rounded-lg bg-gray-800 border border-gray-700">
        <option value="all">All</option>
        <option value="assigned">Assigned</option>
        <option value="unassigned">Unassigned</option>
      </select>
    </div>
  );
}
