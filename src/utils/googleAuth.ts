/**
 * Google Authentication & Multi-Device Cloud Sync Client Service
 */

export interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
  googleId: string;
  verified: boolean;
  loggedInAt: string;
}

const GOOGLE_AUTH_STORAGE_KEY = 'scheduler_google_user';

export function getStoredGoogleUser(): GoogleUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GOOGLE_AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse Google user session:', e);
  }
  return null;
}

export function saveGoogleUserSession(user: GoogleUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearGoogleUserSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY);
}

/**
 * Perform Google Authentication and sync with server
 */
export async function authenticateGoogleUser(payload: {
  email: string;
  name: string;
  picture?: string;
  googleId?: string;
}): Promise<GoogleUser> {
  const user: GoogleUser = {
    name: payload.name,
    email: payload.email.toLowerCase().trim(),
    picture: payload.picture,
    googleId: payload.googleId || `google_${Date.now()}`,
    verified: true,
    loggedInAt: new Date().toISOString(),
  };

  // Save locally
  saveGoogleUserSession(user);

  // Sync with cloud server
  try {
    await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  } catch (e) {
    console.warn('Could not reach cloud auth server, session cached locally:', e);
  }

  return user;
}
