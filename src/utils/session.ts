import { decodeJwt } from 'jose';
import { atlasGqlClient } from '../config/atlas';

export const APP_AUTH_SESSION_KEY = 'app-auth-session';

export interface AppAuthSession {
  atlasToken: string;
  address: string;
  chainId: number;
}

export const isJwtExpired = (token: string): boolean => {
  try {
    const payload = decodeJwt(token);
    
    if (payload && typeof payload.exp === 'number') {
      console.log("[Session Debug] Decoded JWT payload:", payload.exp , payload.exp * 1000 < Date.now(),Date.now());
      return payload.exp * 1000 < Date.now();
    }
    return true;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return true;
  }
};

export const getAppAuthSession = (): AppAuthSession | null => {
  console.log("[Session Debug] Getting app auth session");
  
  if (typeof window === 'undefined') {
    console.log("[Session Debug] Window is undefined, returning null");
    return null;
  }

  const sessionStr = localStorage.getItem(APP_AUTH_SESSION_KEY);
  if (!sessionStr) {
    console.log("[Session Debug] No session found in localStorage");
    return null;
  }

  let session: AppAuthSession;
  try {
    session = JSON.parse(sessionStr) as AppAuthSession;
    console.log("[Session Debug] Successfully parsed session:", { 
      address: session.address,
      chainId: session.chainId,
      hasToken: !!session.atlasToken 
    });
  } catch (error) {
    console.error("[Session Debug] Failed to parse session:", error);
    clearAppAuthSession();
    return null;
  }

  if (isJwtExpired(session.atlasToken)) {
    console.log("[Session Debug] JWT token is expired");
    clearAppAuthSession();
    return null;
  }

  console.log("[Session Debug] Returning valid session");
  return session;
};

export const setAppAuthSession = (atlasToken: string, address: string, chainId: number): void => {
  if (typeof window === 'undefined') return;
  const session: AppAuthSession = { atlasToken, address, chainId };
  localStorage.setItem(APP_AUTH_SESSION_KEY, JSON.stringify(session));
  atlasGqlClient.setHeader('Authorization', `Bearer ${atlasToken}`);
};

export const clearAppAuthSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(APP_AUTH_SESSION_KEY);
  atlasGqlClient.setHeader('Authorization', '');
};

if (typeof window !== 'undefined') {
  const session = getAppAuthSession();
  if (session && session.atlasToken) {
    atlasGqlClient.setHeader('Authorization', `Bearer ${session.atlasToken}`);
  }
} 