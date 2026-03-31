import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface Pool {
  id: number;
  name: string;
  locationAddress: string | null;
  imageUrl: string | null;
  notes: string | null;
  poolType: string;
  paymentType: string | null;
  costPerWeek: number | null;
  costPerVisit: number | null;
  hasChemicalsCost: boolean | null;
  maintenanceDay: string | null;
  maintenanceTime: string | null;
}

export interface CreatePoolData {
  name: string;
  locationAddress?: string;
  imageUrl?: string;
  notes?: string;
  poolType?: string;
  paymentType?: string;
  costPerWeek?: number;
  costPerVisit?: number;
  hasChemicalsCost?: boolean;
  maintenanceDay?: string;
  maintenanceTime?: string;
}

export function getPools(): Promise<Pool[]> {
  return apiGet<Pool[]>('/pools');
}

export function getPoolById(id: number): Promise<Pool> {
  return apiGet<Pool>(`/pools/${id}`);
}

export function createPool(data: CreatePoolData): Promise<Pool> {
  return apiPost<Pool>('/pools', data);
}

export function updatePool(id: number, data: Partial<CreatePoolData>): Promise<Pool> {
  return apiPut<Pool>(`/pools/${id}`, data);
}

export function deletePool(id: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/pools/${id}`);
}
