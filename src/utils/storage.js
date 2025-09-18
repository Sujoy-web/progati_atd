// utils/storage.js
export const loadData = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

export const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};
