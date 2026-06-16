import { apiPost, saveToken, removeToken, getToken, saveUser, removeUser } from './api';

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiPost<LoginResponse>('/auth/login', { email, password });
  await saveToken(data.token);
  await saveUser(data.user);
  return data;
}

export async function logout(): Promise<void> {
  await removeToken();
  await removeUser();
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

export { getToken };
