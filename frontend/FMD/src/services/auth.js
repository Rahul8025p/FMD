import { api } from "./api";

export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("role", res.data.role);
  localStorage.setItem("language", res.data.language || "en");
};

export const register = async (data) => {
  const res = await api.post("/auth/register", data);
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("role", res.data.role);
  localStorage.setItem("language", res.data.language || "en");
};

export const logout = () => {
  localStorage.clear();
};
