import { api, resource } from "./client";

export interface Location {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  isActive: boolean;
  technicianCount: number;
  createdAt: string;
  modifiedAt: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  sortOrder: number;
  serviceCount: number;
  createdAt: string;
  modifiedAt: string;
}

export interface NailService {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  name: string;
  durationMinutes: number;
  price: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
}

export type TechnicianStatus = "active" | "off" | "busy";

export interface Technician {
  id: number;
  locationId: number | null;
  locationName: string | null;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  status: TechnicianStatus;
  createdAt: string;
  modifiedAt: string;
}

export interface TechnicianSchedule {
  id: number;
  technicianId: number;
  technicianName: string;
  locationId: number | null;
  locationName: string | null;
  workDate: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string;
  isOff: boolean;
}

export interface Option {
  id: number;
  name: string;
  extra: string | null;
  parentId: number | null;
}

export interface Options {
  locations: Option[];
  categories: Option[];
  technicians: Option[];
}

export interface DashboardStats {
  locations: number;
  serviceCategories: number;
  services: number;
  technicians: number;
  activeTechnicians: number;
  schedulesToday: number;
}

export interface BulkScheduleRequest {
  technicianIds: number[];
  fromDate: string;
  toDate: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  isOff: boolean;
  overwrite: boolean;
}

export const locationsApi = resource<Location>("/admin/locations");
export const categoriesApi = resource<ServiceCategory>("/admin/service-categories");
export const servicesApi = resource<NailService>("/admin/services");
export const techniciansApi = resource<Technician>("/admin/technicians");
export const schedulesApi = {
  ...resource<TechnicianSchedule>("/admin/technician-schedules"),
  bulk: (body: BulkScheduleRequest) =>
    api
      .post<{ created: number; replaced: number; skipped: number }>("/admin/technician-schedules/bulk", body)
      .then((r) => r.data),
};

export const metaApi = {
  options: () => api.get<Options>("/admin/options").then((r) => r.data),
  dashboard: () => api.get<DashboardStats>("/admin/dashboard").then((r) => r.data),
};

export const authApi = {
  login: (username: string, password: string) =>
    api
      .post<{ token: string; username: string; expiresAt: string }>("/auth/login", { username, password })
      .then((r) => r.data),
  me: () => api.get<{ username: string }>("/auth/me").then((r) => r.data),
};
