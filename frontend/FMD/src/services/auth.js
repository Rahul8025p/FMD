import { api } from "./api";

export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("role", res.data.role);
  const hasManualOverride = localStorage.getItem("langManualOverride") === "1";
  const existingLanguage = localStorage.getItem("language");
  if (!hasManualOverride || !existingLanguage) {
    localStorage.setItem("language", res.data.language || "en");
  }
};

export const register = async (data) => {
  const res = await api.post("/auth/register", data);
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("role", res.data.role);
  const hasManualOverride = localStorage.getItem("langManualOverride") === "1";
  const existingLanguage = localStorage.getItem("language");
  if (!hasManualOverride || !existingLanguage) {
    localStorage.setItem("language", res.data.language || "en");
  }
};

export const logout = () => {
  localStorage.clear();
};
