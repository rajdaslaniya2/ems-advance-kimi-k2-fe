// src/utils/jwt.ts
export function getTokenPayload(): { name?: string; email?: string } {
  const t = localStorage.getItem('token');
  if (!t) return {};
  try {
    return JSON.parse(atob(t.split('.')[1])); // payload part
  } catch {
    return {};
  }
}