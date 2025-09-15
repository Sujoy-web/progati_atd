const STORAGE_KEY = "attendanceSetups";

export const getSetups = async () => {
  return new Promise((resolve) => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setTimeout(() => resolve(data), 200);
  });
};

export const saveSetups = async (data) => {
  return new Promise((resolve) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTimeout(() => resolve({ success: true }), 200);
  });
};
