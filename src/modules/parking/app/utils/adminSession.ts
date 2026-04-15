export type AdminRole = 'Administrador' | 'Policia';

export interface AdminSession {
  username: string;
  displayName: string;
  role: AdminRole;
}

const STORAGE_KEY = 'parkingAdminSession';

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as AdminSession;
  } catch {
    return null;
  }
}

export function setAdminSession(session: AdminSession) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
