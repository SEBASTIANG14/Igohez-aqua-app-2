import { apiGet, apiPost, apiDelete } from './api';

export interface Visit {
  id: number;
  poolId: number;
  userId: number | null;
  date: string;
  visitsCount: number;
  pricePerVisit: number;
  items: any;
  serviceSubtotal: number;
  chemicalsSubtotal: number;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  pool?: {
    id: number;
    name: string;
    locationAddress: string | null;
    poolType: string;
  };
}

export interface CreateVisitData {
  date: string;
  visitsCount?: number;
  pricePerVisit?: number;
  items?: Array<{ product: string; quantity: number; unit: string }>;
  notes?: string;
}

export function getAllVisits(): Promise<Visit[]> {
  return apiGet<Visit[]>('/visits');
}

export function getVisitsByPool(poolId: number): Promise<Visit[]> {
  return apiGet<Visit[]>(`/pools/${poolId}/visits`);
}

export function getVisitById(visitId: number): Promise<Visit> {
  return apiGet<Visit>(`/visits/${visitId}`);
}

export function createVisit(poolId: number, data: CreateVisitData): Promise<Visit> {
  return apiPost<Visit>(`/pools/${poolId}/visits`, data);
}

export function deleteVisit(poolId: number, visitId: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/pools/${poolId}/visits/${visitId}`);
}
