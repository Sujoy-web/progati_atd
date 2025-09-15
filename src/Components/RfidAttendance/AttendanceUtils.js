// Utility functions for attendance logic
export const getTodaySchedule = () => {
  const schedule = JSON.parse(localStorage.getItem("attendanceWeekSchedule") || "[]");
  const today = new Date().toISOString().split("T")[0];
  return schedule.find(s => s.date === today) || {};
};

export const getCurrentMode = (todaySchedule) => {
  if (!todaySchedule.inStart || !todaySchedule.inEnd || !todaySchedule.outStart || !todaySchedule.outEnd) {
    return "in"; // Default mode if schedule not set
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  
  const inStart = new Date(`${today}T${todaySchedule.inStart}`);
  const inEnd = new Date(`${today}T${todaySchedule.inEnd}`);
  const outStart = new Date(`${today}T${todaySchedule.outStart}`);
  const outEnd = new Date(`${today}T${todaySchedule.outEnd}`);

  if (now >= inStart && now <= inEnd) {
    return "in";
  } else if (now > inEnd && now < outStart) {
    return "late";
  } else if (now >= outStart && now <= outEnd) {
    return "out";
  } else {
    return "in"; // Default to in mode outside scheduled times
  }
};

export const getAttendanceStatus = (scanTime, mode, todaySchedule) => {
  if (!todaySchedule.inStart || !todaySchedule.inEnd || !todaySchedule.outStart || !todaySchedule.outEnd) {
    return mode === "in" ? "ontime" : "early";
  }

  const scan = new Date(scanTime);
  const today = scanTime.split("T")[0];

  if (mode === "in") {
    const start = new Date(`${today}T${todaySchedule.inStart}`);
    const end = new Date(`${today}T${todaySchedule.inEnd}`);
    if (scan < start) return "early";
    if (scan > end) return "late";
    return "ontime";
  } else {
    const start = new Date(`${today}T${todaySchedule.outStart}`);
    const end = new Date(`${today}T${todaySchedule.outEnd}`);
    if (scan < start) return "early";
    if (scan > end) return "late";
    return "ontime";
  }
};