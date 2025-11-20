
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Contact, Invoice, Expense, Bond } from './types';
import { MOCK_PRODUCTS, MOCK_CONTACTS, MOCK_INVOICES, MOCK_EXPENSES, MOCK_BONDS } from './constants';

interface DataContextType {
  products: Product[];
  contacts: Contact[];
  invoices: Invoice[];
  expenses: Expense[];
  bonds: Bond[];
  
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

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [bonds, setBonds] = useState<Bond[]>(MOCK_BONDS);

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
      products, contacts, invoices, expenses, bonds,
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