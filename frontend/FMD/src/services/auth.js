import { api } from "./api";

export const login = async (data) => {
  console.log(data);
  const res = await api.post("/auth/login", data);
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("role", res.data.role);
};

export const register = async (data) => {
  const res = await api.post("/auth/register", data);
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("role", res.data.role);
};

export const logout = () => {
  localStorage.clear();
};
