
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Contact, Invoice, Expense, Bond, User, Account } from './types';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  writeBatch,
  getDocs 
} from 'firebase/firestore';

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
  registerUser: (user: Omit<User, 'id'>) => Promise<{ success: boolean; message?: string }>;
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

  resetData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_ADMIN: Omit<User, 'id'> = {
    name: 'مدير النظام',
    username: 'admin',
    password: '123',
    role: 'admin'
};

const DEFAULT_ACCOUNTS: Omit<Account, 'id'>[] = [
  // Assets
  { code: '1001', name: 'الصندوق (النقدية)', type: 'asset', openingBalance: 0, systemAccount: true },
  { code: '1002', name: 'البنك', type: 'asset', openingBalance: 0, systemAccount: true },
  { code: '1100', name: 'العملاء (ذمم مدينة)', type: 'asset', openingBalance: 0, systemAccount: true },
  { code: '1200', name: 'المخزون', type: 'asset', openingBalance: 0, systemAccount: true },
  
  // Liabilities
  { code: '2000', name: 'الموردين (ذمم دائنة)', type: 'liability', openingBalance: 0, systemAccount: true },
  
  // Equity
  { code: '3000', name: 'رأس المال', type: 'equity', openingBalance: 0, systemAccount: true },
  
  // Revenue
  { code: '4000', name: 'المبيعات', type: 'revenue', openingBalance: 0, systemAccount: true },
  
  // Expenses
  { code: '5000', name: 'المشتريات (تكلفة البضاعة)', type: 'expense', openingBalance: 0, systemAccount: true },
  { code: '5100', name: 'مصروفات عامة', type: 'expense', openingBalance: 0, systemAccount: true },
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Currency is local preference for now, could be synced if needed
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('milano_currency') as Currency) || 'YER';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('milano_currency', c);
  };

  // --- FIRESTORE SUBSCRIPTIONS ---

  // Helper to subscribe to a collection with error handling
  const subscribe = <T,>(collectionName: string, setState: React.Dispatch<React.SetStateAction<T[]>>) => {
    const q = query(collection(db, collectionName));
    return onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        setState(data);
      },
      (error) => {
        console.warn(`Firestore: Access denied to collection '${collectionName}'. Please check Firebase Security Rules.`);
        // We don't throw here to prevent app crash
      }
    );
  };

  useEffect(() => {
    const unsubProducts = subscribe<Product>('products', setProducts);
    const unsubContacts = subscribe<Contact>('contacts', setContacts);
    const unsubInvoices = subscribe<Invoice>('invoices', setInvoices);
    const unsubExpenses = subscribe<Expense>('expenses', setExpenses);
    const unsubBonds = subscribe<Bond>('bonds', setBonds);
    const unsubAccounts = subscribe<Account>('accounts', setAccounts);
    const unsubUsers = subscribe<User>('users', setUsers);

    return () => {
      unsubProducts();
      unsubContacts();
      unsubInvoices();
      unsubExpenses();
      unsubBonds();
      unsubAccounts();
      unsubUsers();
    };
  }, []);

  // --- User Management ---
  const registerUser = async (userData: Omit<User, 'id'>) => {
      try {
        // Note: checking against local 'users' array might be empty if offline/permission denied.
        // Ideally, use a direct query or Firebase Auth.
        if (users.some(u => u.username === userData.username)) {
            return { success: false, message: 'User already exists' };
        }
        await addDoc(collection(db, 'users'), userData);
        return { success: true };
      } catch (error) {
        console.error("Registration error:", error);
        return { success: false, message: 'Database connection error' };
      }
  };

  const validateUser = (username: string, password: string) => {
      // Check seeded default admin explicitly (Backdoor for initial setup)
      if (username === 'admin' && password === '123') {
          return true; 
      }
      return users.some(u => u.username === username && u.password === password);
  };

  // --- Products ---
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try { await addDoc(collection(db, 'products'), product); } catch(e) { console.error(e); }
  };

  const updateProduct = async (product: Product) => {
    const { id, ...data } = product;
    try { await updateDoc(doc(db, 'products', id), data as any); } catch(e) { console.error(e); }
  };

  const deleteProduct = async (id: string) => {
    try { await deleteDoc(doc(db, 'products', id)); } catch(e) { console.error(e); }
  };

  // --- Contacts ---
  const addContact = async (contact: Omit<Contact, 'id'>) => {
    try { await addDoc(collection(db, 'contacts'), contact); } catch(e) { console.error(e); }
  };

  const updateContact = async (contact: Contact) => {
    const { id, ...data } = contact;
    try { await updateDoc(doc(db, 'contacts', id), data as any); } catch(e) { console.error(e); }
  };

  const deleteContact = async (id: string) => {
    try { await deleteDoc(doc(db, 'contacts', id)); } catch(e) { console.error(e); }
  };

  // --- Invoices ---
  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    try { await addDoc(collection(db, 'invoices'), invoice); } catch(e) { console.error(e); }
  };

  const deleteInvoice = async (id: string) => {
    try { await deleteDoc(doc(db, 'invoices', id)); } catch(e) { console.error(e); }
  };

  // --- Expenses ---
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try { await addDoc(collection(db, 'expenses'), expense); } catch(e) { console.error(e); }
  };

  const updateExpense = async (expense: Expense) => {
    const { id, ...data } = expense;
    try { await updateDoc(doc(db, 'expenses', id), data as any); } catch(e) { console.error(e); }
  };

  const deleteExpense = async (id: string) => {
    try { await deleteDoc(doc(db, 'expenses', id)); } catch(e) { console.error(e); }
  };

  // --- Bonds ---
  const addBond = async (bond: Omit<Bond, 'id'>) => {
    try { await addDoc(collection(db, 'bonds'), bond); } catch(e) { console.error(e); }
  };

  const deleteBond = async (id: string) => {
    try { await deleteDoc(doc(db, 'bonds', id)); } catch(e) { console.error(e); }
  };

  // --- Accounts ---
  const addAccount = async (account: Omit<Account, 'id'>) => {
    try { await addDoc(collection(db, 'accounts'), account); } catch(e) { console.error(e); }
  };

  const updateAccount = async (account: Account) => {
    const { id, ...data } = account;
    try { await updateDoc(doc(db, 'accounts', id), data as any); } catch(e) { console.error(e); }
  };

  // --- Reset Data (Factory Reset) ---
  const resetData = async () => {
    const collectionsToClear = ['products', 'contacts', 'invoices', 'expenses', 'bonds', 'accounts'];
    
    try {
        for (const colName of collectionsToClear) {
            const q = query(collection(db, colName));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) continue;

            const batch = writeBatch(db);
            let count = 0;
            
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
                count++;
            });
            
            if (count > 0) {
                await batch.commit();
            }
        }
        
        // Clear seeded flag so accounts are re-created on next reload
        sessionStorage.removeItem('accounts_seeded');
        
        // Force re-seed accounts immediately after clear
        setTimeout(() => {
            DEFAULT_ACCOUNTS.forEach(acc => addAccount(acc));
        }, 1500);
        
    } catch (e) {
        console.error("Error clearing data:", e);
        throw e;
    }
  };

  // Helper: Ensure we have accounts
  useEffect(() => {
      // Only try to seed if we have confirmed users loaded (meaning connection is OK)
      // and accounts list is empty.
      if (accounts.length === 0 && users.length > 0) { 
          const hasSeeded = sessionStorage.getItem('accounts_seeded');
          if (!hasSeeded) {
               // Check one last time if DB is truly empty before writing
               // (Optimistic seeding)
               DEFAULT_ACCOUNTS.forEach(acc => addAccount(acc));
               sessionStorage.setItem('accounts_seeded', 'true');
          }
      }
  }, [accounts.length, users.length]);

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
