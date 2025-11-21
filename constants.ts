
import { Product, Contact, Invoice, Stats, Expense, Bond } from './types';

export const MOCK_STATS: Stats = {
  sales: 0,
  purchases: 0,
  expenses: 0,
  balance: 0,
  profit: 0
};

// Empty arrays for production ready state
export const MOCK_PRODUCTS: Product[] = [];
export const MOCK_CONTACTS: Contact[] = [];
export const MOCK_INVOICES: Invoice[] = [];
export const MOCK_EXPENSES: Expense[] = [];
export const MOCK_BONDS: Bond[] = [];
export const CHART_DATA = [];
