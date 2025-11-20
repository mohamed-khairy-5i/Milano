
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Contact, Invoice, Expense, Bond } from './types';
import { MOCK_PRODUCTS, MOCK_CONTACTS, MOCK_INVOICES, MOCK_EXPENSES, MOCK_BONDS } from './constants';

export type Currency = 'YER' | 'SAR' | 'USD';

interface DataContextType {
  products: Product[];
  contacts: Contact[];
  invoices: Invoice[];
  expenses: Expense[];
  bonds: Bond[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to load from localStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or fallback to MOCK/Empty
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('milano_products', MOCK_PRODUCTS));
  const [contacts, setContacts] = useState<Contact[]>(() => loadFromStorage('milano_contacts', MOCK_CONTACTS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage('milano_invoices', MOCK_INVOICES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('milano_expenses', MOCK_EXPENSES));
  const [bonds, setBonds] = useState<Bond[]>(() => loadFromStorage('milano_bonds', MOCK_BONDS));
  const [currency, setCurrency] = useState<Currency>(() => loadFromStorage('milano_currency', 'YER'));

  // Persist to localStorage whenever state changes
  useEffect(() => localStorage.setItem('milano_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('milano_contacts', JSON.stringify(contacts)), [contacts]);
  useEffect(() => localStorage.setItem('milano_invoices', JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem('milano_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('milano_bonds', JSON.stringify(bonds)), [bonds]);
  useEffect(() => localStorage.setItem('milano_currency', JSON.stringify(currency)), [currency]);

  // Helper to generate ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

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

  return (
    <DataContext.Provider value={{
      products, contacts, invoices, expenses, bonds, currency, setCurrency,
      addProduct, updateProduct, deleteProduct,
      addContact, updateContact, deleteContact,
      addInvoice, deleteInvoice,
      addExpense, updateExpense, deleteExpense,
      addBond, deleteBond
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
