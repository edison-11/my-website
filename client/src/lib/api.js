const defaultApiBase = import.meta.env.DEV || ['5000', '5001'].includes(window.location.port)
  ? '/api'
  : `${window.location.protocol}//${window.location.hostname}:5000/api`;
const API_BASE = (import.meta.env.VITE_API_URL || defaultApiBase).replace(/\/$/, '');

export async function api(path, options = {}, token = '') {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(`Cannot reach the website server at ${API_BASE}. Start the server or set VITE_API_URL to its API address.`);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'The request could not be completed.');
    error.status = response.status;
    error.details = data.errors || [];
    throw error;
  }
  return data;
}

export const send = (method, body) => ({ method, body: JSON.stringify(body) });

export async function uploadFile(path, file, token, fields = {}) {
  let response;
  try {
    const query = new URLSearchParams({ filename: file.name, ...fields });
    response = await fetch(`${API_BASE}${path}?${query}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.type },
      body: file,
    });
  } catch {
    throw new Error(`Cannot reach the website server at ${API_BASE}. Start the server or set VITE_API_URL to its API address.`);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'The file could not be uploaded.');
  return data;
}
