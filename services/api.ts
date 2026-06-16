import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const BASE_URL = 'http://192.168.1.198:3000/api';
const TOKEN_KEY = 'poolflow_token';

// Token helpers — SecureStore on device, localStorage on web
export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// Generic fetch wrapper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export function apiGet<T>(endpoint: string) {
  return request<T>(endpoint, { method: 'GET' });
}

export function apiPost<T>(endpoint: string, data: any) {
  return request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiPut<T>(endpoint: string, data: any) {
  return request<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function apiDelete<T>(endpoint: string) {
  return request<T>(endpoint, { method: 'DELETE' });
}
