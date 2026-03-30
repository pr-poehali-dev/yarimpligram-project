const AUTH_URL = "https://functions.poehali.dev/204c03d8-ac63-4424-b6f0-748161ebb2de";
const FRIENDS_URL = "https://functions.poehali.dev/a5b5f71a-f854-4625-b70e-452472de38bf";

function getToken(): string {
  return localStorage.getItem("yg_token") || "";
}

function authHeaders() {
  return { "Content-Type": "application/json", "X-Auth-Token": getToken() };
}

export async function apiRegister(username: string, displayName: string, password: string, phone?: string) {
  const r = await fetch(`${AUTH_URL}?action=register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, display_name: displayName, password, phone: phone || "" }),
  });
  return r.json();
}

export async function apiLogin(username: string, password: string) {
  const r = await fetch(`${AUTH_URL}?action=login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return r.json();
}

export async function apiMe() {
  const r = await fetch(`${AUTH_URL}?action=me`, { headers: authHeaders() });
  return r.json();
}

export async function apiLogout() {
  await fetch(`${AUTH_URL}?action=logout`, { method: "POST", headers: authHeaders() });
  localStorage.removeItem("yg_token");
}

export async function apiFriendsSearch(q: string) {
  const r = await fetch(`${FRIENDS_URL}?action=search&q=${encodeURIComponent(q)}`, { headers: authHeaders() });
  return r.json();
}

export async function apiFriendsAdd(username: string) {
  const r = await fetch(`${FRIENDS_URL}?action=add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ username }),
  });
  return r.json();
}

export async function apiFriendsList() {
  const r = await fetch(`${FRIENDS_URL}?action=list`, { headers: authHeaders() });
  return r.json();
}

export async function apiFriendAccept(userId: number) {
  const r = await fetch(`${FRIENDS_URL}?action=accept`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ user_id: userId }),
  });
  return r.json();
}
