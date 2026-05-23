export const setItemInLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getItemInLocalStorage = (key: string) => {
  const value = localStorage.getItem(key);
  if (value !== null && value !== "undefined" && value !== undefined)
    return JSON.parse(value);
  return "";
};

export const removeItemInLocalStorage = (key: string) => {
  const value = localStorage.getItem(key);
  if (value !== null && value !== undefined) localStorage.removeItem(key);
};
