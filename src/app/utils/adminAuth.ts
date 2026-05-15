const ADMIN_AUTH_KEY = "clinical_mastery_admin_auth";

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

export function isAdminAuthenticated(): boolean {
  return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function loginAdmin(username: string, password: string): boolean {
  const isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  if (isValid) {
    localStorage.setItem(ADMIN_AUTH_KEY, "true");
  }
  return isValid;
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_AUTH_KEY);
}
