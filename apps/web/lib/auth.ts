export type DispatcherRole = "dispatcher" | "supervisor" | "admin";

export interface DispatcherSession {
  userId: string;
  role: DispatcherRole;
  token: string;
}

export function readSession(): DispatcherSession | null {
  if (typeof window === "undefined") return null;
  const token = window.sessionStorage.getItem("dispatcher_token");
  return token ? { userId: "current-user", role: "dispatcher", token } : null;
}
