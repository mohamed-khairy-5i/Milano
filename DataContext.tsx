
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Contact, Invoice, Expense, Bond, User, Account } from './types';
import { MOCK_PRODUCTS, MOCK_CONTACTS, MOCK_INVOICES, MOCK_EXPENSES, MOCK_BONDS } from './constants';

export type Currency = 'YER' | 'SAR' | 'USD';

interface DataContextType {
  products: Product[];
  contacts: Contact[];
  invoices: Invoice[];
  expenses: Expense[];
  bonds: Bond[];
  accounts: Account[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  
  // User Management
  users: User[];
  registerUser: (user: Omit<User, 'id'>) => { success: boolean; message?: string };
  validateUser: (username: string, password: string) => boolean;

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;

  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  deleteInvoice: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;

  addBond: (bond: Omit<Bond, 'id'>) => void;
  deleteBond: (id: string) => void;

  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;

  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to load from localStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

const DEFAULT_ADMIN: User = {
    id: 'admin',
    name: 'مدير النظام',
    username: 'admin',
    password: '123',
    role: 'admin'
};

const DEFAULT_ACCOUNTS: Account[] = [
  // Assets
  { id: '1001', code: '1001', name: 'الصندوق (النقدية)', type: 'asset', openingBalance: 0, systemAccount: true },
  { id: '1002', code: '1002', name: 'البنك', type: 'asset', openingBalance: 0, systemAccount: true },
  { id: '1100', code: '1100', name: 'العملاء (ذمم مدينة)', type: 'asset', openingBalance: 0, systemAccount: true },
  { id: '1200', code: '1200', name: 'المخزون', type: 'asset', openingBalance: 0, systemAccount: true },
  
  // Liabilities
  { id: '2000', code: '2000', name: 'الموردين (ذمم دائنة)', type: 'liability', openingBalance: 0, systemAccount: true },
  
  // Equity
  { id: '3000', code: '3000', name: 'رأس المال', type: 'equity', openingBalance: 0, systemAccount: true },
  
  // Revenue
  { id: '4000', code: '4000', name: 'المبيعات', type: 'revenue', openingBalance: 0, systemAccount: true },
  
  // Expenses
  { id: '5000', code: '5000', name: 'المشتريات (تكلفة البضاعة)', type: 'expense', openingBalance: 0, systemAccount: true },
  { id: '5100', code: '5100', name: 'مصروفات عامة', type: 'expense', openingBalance: 0, systemAccount: true },
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or fallback to MOCK/Empty
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('milano_products', MOCK_PRODUCTS));
  const [contacts, setContacts] = useState<Contact[]>(() => loadFromStorage('milano_contacts', MOCK_CONTACTS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage('milano_invoices', MOCK_INVOICES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('milano_expenses', MOCK_EXPENSES));
  const [bonds, setBonds] = useState<Bond[]>(() => loadFromStorage('milano_bonds', MOCK_BONDS));
  const [currency, setCurrency] = useState<Currency>(() => loadFromStorage('milano_currency', 'YER'));
  const [accounts, setAccounts] = useState<Account[]>(() => loadFromStorage('milano_accounts', DEFAULT_ACCOUNTS));
  
  // Load users, ensuring at least admin exists
  const [users, setUsers] = useState<User[]>(() => {
      const savedUsers = loadFromStorage<User[]>('milano_users', []);
      if (savedUsers.length === 0) return [DEFAULT_ADMIN];
      return savedUsers;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => localStorage.setItem('milano_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('milano_contacts', JSON.stringify(contacts)), [contacts]);
  useEffect(() => localStorage.setItem('milano_invoices', JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem('milano_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('milano_bonds', JSON.stringify(bonds)), [bonds]);
  useEffect(() => localStorage.setItem('milano_currency', JSON.stringify(currency)), [currency]);
  useEffect(() => localStorage.setItem('milano_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('milano_accounts', JSON.stringify(accounts)), [accounts]);

  // Helper to generate ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --- Reset Data ---
  const resetData = () => {
    setProducts(MOCK_PRODUCTS);
    setContacts(MOCK_CONTACTS);
    setInvoices(MOCK_INVOICES);
    setExpenses(MOCK_EXPENSES);
    setBonds(MOCK_BONDS);
    setAccounts(DEFAULT_ACCOUNTS);
    // We generally don't reset Users or Currency to avoid locking the user out
  };

  // --- User Management ---
  const registerUser = (userData: Omit<User, 'id'>) => {
      if (users.some(u => u.username === userData.username)) {
          return { success: false, message: 'User already exists' };
      }
      const newUser = { ...userData, id: generateId() };
      setUsers(prev => [...prev, newUser]);
      return { success: true };
  };

  const validateUser = (username: string, password: string) => {
      return users.some(u => u.username === username && u.password === password);
  };

  // --- Products ---
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: generateId() };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // --- Contacts ---
  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact = { ...contact, id: generateId() };
    setContacts(prev => [newContact, ...prev]);
  };

  const updateContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // --- Invoices ---
  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = { ...invoice, id: generateId() };
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  // --- Expenses ---
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: generateId() };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // --- Bonds ---
  const addBond = (bond: Omit<Bond, 'id'>) => {
    const newBond = { ...bond, id: generateId() };
    setBonds(prev => [newBond, ...prev]);
  };

  const deleteBond = (id: string) => {
    setBonds(prev => prev.filter(b => b.id !== id));
  };

  // --- Accounts ---
  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = { ...account, id: generateId() };
    setAccounts(prev => [...prev, newAccount]);
  };

  const updateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(a => a.id === updatedAccount.id ? updatedAccount : a));
  };

  return (
    <DataContext.Provider value={{
      products, contacts, invoices, expenses, bonds, accounts, currency, setCurrency,
      users, registerUser, validateUser,
      addProduct, updateProduct, deleteProduct,
      addContact, updateContact, deleteContact,
      addInvoice, deleteInvoice,
      addExpense, updateExpense, deleteExpense,
      addBond, deleteBond,
      addAccount, updateAccount,
      resetData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
