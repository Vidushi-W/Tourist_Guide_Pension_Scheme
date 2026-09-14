import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api', withCredentials: true, headers: { 'Content-Type': 'application/json' } });
export const errorMessage = (error: unknown) => axios.isAxiosError(error) ? error.response?.data?.error?.message ?? error.message : error instanceof Error ? error.message : 'Something went wrong';

