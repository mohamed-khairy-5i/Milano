
// Global Types

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  priceBuy: number;
  priceSell: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  image?: string;
  barcode?: string;
  description?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // Positive: They owe us, Negative: We owe them
  creditLimit?: number;
  taxNumber?: string;
  notes?: string;
  status: 'active' | 'inactive';
  type: 'customer' | 'supplier';
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate?: string;
  contactName: string;
  contactId: string;
  total: number;
  tax: number;
  status: 'paid' | 'pending' | 'cancelled' | 'credit'; // Added 'credit' for Ajel
  type: 'sale' | 'purchase';
  itemsCount: number;
  items?: InvoiceItem[];
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
}

export interface Bond {
  id: string;
  number: string;
  type: 'receipt' | 'payment'; // receipt = قبض, payment = صرف
  date: string;
  entityType: 'customer' | 'supplier';
  entityId: string;
  entityName: string;
  amount: number;
  paymentMethod: 'cash' | 'bank';
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Stats {
  sales: number;
  purchases: number;
  expenses: number;
  balance: number;
  profit: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string; // In real app, this should be hashed
  role: 'admin' | 'user';
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  openingBalance: number;
  description?: string;
  systemAccount?: boolean; // Cannot be deleted if true
}

export type ViewState = 
  | 'dashboard' 
  | 'pos' 
  | 'inventory' 
  | 'invoices' 
  | 'invoices-purchase'
  | 'customers' 
  | 'suppliers' 
  | 'expenses'
  | 'stock'
  | 'accounting' // This is Bonds
  | 'accounts'   // This is the new Accounts Management (Ledger, Chart of Accounts, etc.)
  | 'reports'
  | 'settings';