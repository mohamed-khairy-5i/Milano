
// Global Types

export interface UserPermissions {
  canSell: boolean;         // POS Only
  canManageInvoices: boolean; // Sales & Purchases Lists
  canManageStock: boolean;  // Inventory & Stock
  canManageContacts: boolean; // Customers & Suppliers
  canManageAccounting: boolean; // Bonds, Expenses, Accounts
  canViewReports: boolean;
  canManageSettings: boolean; // Add users, change settings
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string; // In real app, this should be hashed
  role: 'admin' | 'user';
  storeId: string; // Critical for data isolation
  permissions: UserPermissions;
  createdAt?: string;
}

// Base interface for all data types to ensure they belong to a store
interface StoreData {
  storeId: string;
}

export interface Product extends StoreData {
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

export interface Contact extends StoreData {
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

export interface Invoice extends StoreData {
  id: string;
  number: string;
  date: string;
  dueDate?: string;
  contactName: string;
  contactId: string;
  total: number;
  tax: number;
  status: 'paid' | 'pending' | 'cancelled' | 'credit';
  type: 'sale' | 'purchase';
  itemsCount: number;
  items?: InvoiceItem[];
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
}

export interface Bond extends StoreData {
  id: string;
  number: string;
  type: 'receipt' | 'payment';
  date: string;
  entityType: 'customer' | 'supplier';
  entityId: string;
  entityName: string;
  amount: number;
  currency: string; // Added currency field
  paymentMethod: 'cash' | 'bank';
  notes?: string;
}

export interface Expense extends StoreData {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}

export interface CartItem {
  id: string;
  name: string;
  priceSell: number;
  quantity: number;
}

export interface Stats {
  sales: number;
  purchases: number;
  expenses: number;
  balance: number;
  profit: number;
}

export interface Account extends StoreData {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  openingBalance: number;
  description?: string;
  systemAccount?: boolean;
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
  | 'accounting'
  | 'accounts'
  | 'reports'
  | 'settings';
