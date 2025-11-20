
import { Product, Contact, Invoice, Stats, Expense, Bond } from './types';

export const MOCK_STATS: Stats = {
  sales: 0,
  purchases: 0,
  expenses: 0,
  balance: 0,
  profit: 0
};

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_CONTACTS: Contact[] = [
  { 
    id: '0', 
    name: 'عميل عام', 
    phone: '', 
    email: '', 
    address: '', 
    balance: 0, 
    creditLimit: 0,
    status: 'active', 
    type: 'customer' 
  }
];

export const MOCK_INVOICES: Invoice[] = [];

export const MOCK_EXPENSES: Expense[] = [];

export const MOCK_BONDS: Bond[] = [];

export const CHART_DATA = [];
