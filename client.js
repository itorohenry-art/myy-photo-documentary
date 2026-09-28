export const API_BASE_URL = 'https://photography-api-88wq.onrender.com';

export class ApiError extends Error {
	constructor(message, status) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

export async function apiRequest(path, { method = 'GET', body, token, signal } = {}) {
	const headers = { Accept: 'application/json' };
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	if (token) headers.Authorization = `Bearer ${token}`;

	let response;
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			method,
		headers,
			body: body === undefined ? undefined : JSON.stringify(body),
			signal,
		});
	} catch (error) {
		if (error.name === 'AbortError') throw error;
		throw new ApiError('The Ashworld service could not be reached. Please try again.', 0);
	}

	const payload = await response.json().catch(() => null);
	if (!response.ok) {
		const message = payload?.message || payload?.error || `Request failed (${response.status}).`;
		throw new ApiError(message, response.status);
	}
	return payload;
}

export function unwrapData(payload) {
	return payload?.data ?? payload;
}

export function getArray(payload, ...keys) {
	const data = unwrapData(payload);
	if (Array.isArray(data)) return data;
	for (const key of keys) {
		if (Array.isArray(data?.[key])) return data[key];
	}
	return [];
}

export function getAuthToken(payload) {
	const data = unwrapData(payload);
	return data?.token || data?.accessToken || data?.access_token || payload?.token || payload?.accessToken || payload?.access_token || '';
}

export function getAuthUser(payload) {
	const data = unwrapData(payload);
	return data?.user || data?.account || payload?.user || payload?.account || (data?.email ? data : null);
}