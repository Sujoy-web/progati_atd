// ...existing code...
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AppLayout from "./Layout/AppLayout";

import AssignPage from "./Pages/AssignPage";
import YearPlannerPage from "./Pages/YearPlannerPage";
import AttendanceTimeSetupPage from "./Pages/AttendanceTimeSetupPage"; // <-- added import
import RfidAttendancePage from "./Pages/RfidAttendancePage";

import AttendanceReportPage from "./Pages/AttendanceReportPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/assign" element={<AssignPage />} />
          <Route path="/yearplanner" element={<YearPlannerPage />} />
          <Route path="/time" element={<AttendanceTimeSetupPage />} />
          <Route path="/rfidattendance" element={<RfidAttendancePage/>} />
          <Route path="/report" element={<AttendanceReportPage/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
// ...existing code...
