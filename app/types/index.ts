/* ===================================================================
   Gearify v2 — TypeScript Interfaces
   Mirrors the SQLAlchemy models from api/models.py
   =================================================================== */

export interface Vehicle {
  id: number;
  registration_no: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: "car" | "lcv" | "motorcycle";
  current_km: number;
  vin: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  created_at: string;
  latest_service: LatestService | null;
  health_score: number;
  status: "good" | "warning" | "danger";
}

export interface LatestService {
  id: number;
  km_at_service: number;
  next_service_km: number;
  total_cost: number;
  currency: string;
  created_at: string;
}

export interface ServicePart {
  id: number;
  name: string;
  brand: string;
  category: string;
  vehicle_type_scope: "car" | "motorcycle" | "all";
  unit_price: number;
  currency: string;
  is_active: boolean;
  updated_at: string;
}

export interface ServiceLineItem {
  id: number;
  service_part_id: number | null;
  part_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  subtotal: number;
}

export interface ServiceRecord {
  id: number;
  vehicle_id: number;
  mechanic_id: number;
  labor_cost: number;
  total_cost: number;
  currency: string;
  km_at_service: number;
  next_service_km: number;
  mechanic_notes: string | null;
  created_at: string;
  line_items: ServiceLineItem[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "mechanic" | "admin";
  created_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  detail?: string;
}

export interface VehiclesResponse {
  vehicles: Vehicle[];
  count: number;
}

export type ThemeMode = "light" | "dark";

export type VehicleStatus = "good" | "warning" | "danger";
