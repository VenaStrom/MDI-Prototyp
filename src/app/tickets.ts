import { Location as L } from '../locations';

export interface AppTicket {
  id: string;
  from: string;
  to: string;
  date: string;
  validFrom: string;
  validUntil: string;
  price: number;
  operators: string[];
  status: 'active';
}

export const ALWAYS_MOCK_TICKET: AppTicket = {
  id: 'mock-ticket-1',
  from: L.UppsalaC,
  to: L.StockholmC,
  date: '2026-03-07',
  validFrom: '08:15',
  validUntil: '10:15',
  price: 145,
  operators: ['UL'],
  status: 'active',
} as const;
