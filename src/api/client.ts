import axios, { AxiosError } from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8282/api";
const TOKEN_KEY = "nailroom_admin_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({ baseURL: API_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const t = tokenStore.get();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401 && !err.config?.url?.includes("/auth/login")) {
      tokenStore.clear();
      window.dispatchEvent(new Event("nailroom:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export interface ApiErrorBody {
  status?: number;
  message?: string;
  errors?: Record<string, string>;
}

export function errorMessage(err: unknown): string {
  const ax = err as AxiosError<ApiErrorBody>;
  if (ax?.response?.data?.message) return ax.response.data.message;
  if (ax?.code === "ERR_NETWORK") return "Không kết nối được server (" + API_URL + ")";
  return (ax as Error)?.message || "Có lỗi xảy ra";
}

export function fieldErrors(err: unknown): Record<string, string> {
  return (err as AxiosError<ApiErrorBody>)?.response?.data?.errors || {};
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

/** CRUD helper chung cho mọi resource /api/admin/{resource} */
export function resource<T, P = Partial<T>>(path: string) {
  return {
    list: (params: Record<string, unknown>) =>
      api.get<PageResponse<T>>(path, { params: clean(params) }).then((r) => r.data),
    get: (id: number) => api.get<T>(`${path}/${id}`).then((r) => r.data),
    create: (body: P) => api.post<T>(path, body).then((r) => r.data),
    update: (id: number, body: P) => api.put<T>(`${path}/${id}`, body).then((r) => r.data),
    remove: (id: number) => api.delete(`${path}/${id}`),
  };
}

function clean(params: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  });
  return out;
}
