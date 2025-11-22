
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Contact, Invoice, Expense, Bond, User, Account, UserPermissions } from './types';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  writeBatch,
  getDocs,
  setDoc
} from 'firebase/firestore';

export type Currency = 'YER' | 'SAR' | 'USD';

interface DataContextType {
  currentUser: User | null;
  storeName: string;
  products: Product[];
  contacts: Contact[];
  invoices: Invoice[];
  expenses: Expense[];
  bonds: Bond[];
  accounts: Account[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  
  // User Management
  users: User[]; // List of employees for the current store
  registerStore: (user: Omit<User, 'id' | 'storeId' | 'permissions'>) => Promise<{ success: boolean; message?: string }>;
  addEmployee: (user: Omit<User, 'id' | 'storeId'>) => Promise<{ success: boolean; message?: string }>;
  loginUser: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => void;
  deleteUser: (id: string) => Promise<void>;
  
  updateStoreSettings: (data: { name: string }) => Promise<void>;

  addProduct: (product: Omit<Product, 'id' | 'storeId'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  addContact: (contact: Omit<Contact, 'id' | 'storeId'>) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;

  addInvoice: (invoice: Omit<Invoice, 'id' | 'storeId'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'storeId'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;

  addBond: (bond: Omit<Bond, 'id' | 'storeId'>) => void;
  updateBond: (bond: Bond) => void;
  deleteBond: (id: string) => void;

  addAccount: (account: Omit<Account, 'id' | 'storeId'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;

  resetData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_PERMISSIONS: UserPermissions = {
  canSell: true,
  canManageStock: true,
  canManageContacts: true,
  canManageAccounting: true,
  canViewReports: true,
  canManageSettings: true
};

// Helper to safely extract ID from string or object (Firestore Ref)
// Prevents circular references if a Ref object is passed
const safeId = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  // Check if it's an object with an 'id' property (like a DocumentReference)
  if (typeof val === 'object' && val !== null && 'id' in val) {
    return String(val.id);
  }
  return '';
};

// Helper to safely sanitize permissions
const safePermissions = (perm: any): UserPermissions => {
  if (!perm) return DEFAULT_PERMISSIONS;
  return {
    canSell: !!perm.canSell,
    canManageStock: !!perm.canManageStock,
    canManageContacts: !!perm.canManageContacts,
    canManageAccounting: !!perm.canManageAccounting,
    canViewReports: !!perm.canViewReports,
    canManageSettings: !!perm.canManageSettings,
  };
};

// Explicitly construct a safe User object with NO internal Firestore objects
const sanitizeUser = (user: any): User => {
  if (!user) return null as any;
  return {
    id: String(user.id || ''),
    name: String(user.name || ''),
    username: String(user.username || ''),
    password: String(user.password || ''),
    role: user.role === 'admin' ? 'admin' : 'user',
    storeId: safeId(user.storeId), // Ensure this is a string
    permissions: safePermissions(user.permissions),
    createdAt: String(user.createdAt || new Date().toISOString())
  };
};

// Default Accounts Template for new stores
const DEFAULT_ACCOUNTS_TEMPLATE = [
  { code: '1001', name: 'الصندوق (النقدية)', type: 'asset', openingBalance: 0, systemAccount: true },
  { code: '1002', name: 'البنك', type: 'asset', openingBalance: 0, systemAccount: true },
  { code: '1100', name: 'العملاء (ذمم مدينة)', type: 'asset', openingBalance: 0, systemAccount: true },
  { code: '1200', name: 'المخزون', type: 'asset', openingBalance: 0, systemAccount: true },
  { code: '2000', name: 'الموردين (ذمم دائنة)', type: 'liability', openingBalance: 0, systemAccount: true },
  { code: '3000', name: 'رأس المال', type: 'equity', openingBalance: 0, systemAccount: true },
  { code: '4000', name: 'المبيعات', type: 'revenue', openingBalance: 0, systemAccount: true },
  { code: '5000', name: 'المشتريات (تكلفة البضاعة)', type: 'expense', openingBalance: 0, systemAccount: true },
  { code: '5100', name: 'مصروفات عامة', type: 'expense', openingBalance: 0, systemAccount: true },
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('milano_user_session');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing session:", e);
      return null;
    }
  });

  // Data State
  const [storeName, setStoreName] = useState('Milano Store');
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]); 
  
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('milano_currency') as Currency) || 'YER';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('milano_currency', c);
  };

  // Persist User Session - PARANOID SANITIZATION
  useEffect(() => {
    if (currentUser) {
      try {
        // Defensive copy: Ensure NO Firestore References or complex objects are passed to JSON.stringify
        const safeUser: User = sanitizeUser(currentUser);
        localStorage.setItem('milano_user_session', JSON.stringify(safeUser));
      } catch (error) {
        console.error("Error saving session to localStorage:", error);
        // If saving fails (e.g. circular ref still exists), clear session to prevent crash loop
        localStorage.removeItem('milano_user_session');
      }
    } else {
      localStorage.removeItem('milano_user_session');
      // Clear data when logged out
      setStoreName('Milano Store');
      setProducts([]);
      setContacts([]);
      setInvoices([]);
      setExpenses([]);
      setBonds([]);
      setAccounts([]);
      setUsers([]);
    }
  }, [currentUser]);

  // --- FIRESTORE SUBSCRIPTIONS (Isolated by storeId) ---

  useEffect(() => {
    if (!currentUser?.storeId) return;

    const storeId = safeId(currentUser.storeId);

    // Subscribe to Store Details
    const unsubStore = onSnapshot(doc(db, 'stores', storeId), (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            if (data.name) setStoreName(data.name);
        }
    });

    const subscribe = <T,>(collectionName: string, setState: React.Dispatch<React.SetStateAction<T[]>>) => {
      const q = query(collection(db, collectionName), where('storeId', '==', storeId));
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => {
            // Flatten data to avoid nested Firestore objects
            const docData = doc.data();
            return { 
                id: doc.id, 
                ...docData,
                // IMPORTANT: Sanitize storeId for all docs to prevent Refs in state
                storeId: safeId(docData.storeId),
                // Explicitly convert Timestamp objects if they exist in the data
                ...(docData.createdAt && typeof docData.createdAt.toDate === 'function' ? { createdAt: docData.createdAt.toDate().toISOString() } : {}),
                ...(docData.date && typeof docData.date.toDate === 'function' ? { date: docData.date.toDate().toISOString() } : {})
            } as T;
        });
        setState(data);
      }, (error) => console.error(`Error fetching ${collectionName}:`, error));
    };

    const unsubProducts = subscribe<Product>('products', setProducts);
    const unsubContacts = subscribe<Contact>('contacts', setContacts);
    const unsubInvoices = subscribe<Invoice>('invoices', setInvoices);
    const unsubExpenses = subscribe<Expense>('expenses', setExpenses);
    const unsubBonds = subscribe<Bond>('bonds', setBonds);
    const unsubAccounts = subscribe<Account>('accounts', setAccounts);
    const unsubUsers = subscribe<User>('users', setUsers);

    return () => {
      unsubStore();
      unsubProducts();
      unsubContacts();
      unsubInvoices();
      unsubExpenses();
      unsubBonds();
      unsubAccounts();
      unsubUsers();
    };
  }, [currentUser]);


  // --- AUTH & USER MANAGEMENT ---

  const registerStore = async (userData: Omit<User, 'id' | 'storeId' | 'permissions'>) => {
    try {
      const q = query(collection(db, 'users'), where('username', '==', userData.username));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { success: false, message: 'Username already taken' };
      }

      const newStoreId = `STORE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newUser: Omit<User, 'id'> = {
        ...userData,
        role: 'admin',
        storeId: newStoreId,
        permissions: DEFAULT_PERMISSIONS,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'users'), newUser);
      
      await setDoc(doc(db, 'stores', newStoreId), { name: 'Milano Store' });

      const batch = writeBatch(db);
      DEFAULT_ACCOUNTS_TEMPLATE.forEach(acc => {
        const docRef = doc(collection(db, 'accounts'));
        batch.set(docRef, { ...acc, storeId: newStoreId });
      });
      await batch.commit();

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: 'Database error' };
    }
  };

  const addEmployee = async (userData: Omit<User, 'id' | 'storeId'>) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    
    try {
        const q = query(collection(db, 'users'), where('username', '==', userData.username));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return { success: false, message: 'Username already exists' };
        }

        const storeId = safeId(currentUser.storeId);

        const newEmployee: Omit<User, 'id'> = {
            ...userData,
            storeId: storeId,
            createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'users'), newEmployee);
        return { success: true };
    } catch (error) {
        console.error("Add employee error:", error);
        return { success: false, message: 'Failed to add employee' };
    }
  };

  const loginUser = async (username: string, password: string) => {
    try {
      const q = query(collection(db, 'users'), where('username', '==', username), where('password', '==', password));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        if (username === 'admin' && password === '123') {
            const dummyAdmin: User = {
                id: 'legacy-admin',
                name: 'مدير النظام',
                username: 'admin',
                password: '123',
                role: 'admin',
                storeId: 'main-store',
                permissions: DEFAULT_PERMISSIONS,
                createdAt: new Date().toISOString()
            };
            setCurrentUser(dummyAdmin);
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials' };
      }

      const docSnap = snapshot.docs[0];
      const rawData = docSnap.data();
      
      // STRICT CONVERSION: Ensure no Firestore objects leak into state
      const userData: User = {
        id: docSnap.id,
        name: String(rawData.name || ''),
        username: String(rawData.username || ''),
        password: String(rawData.password || ''),
        role: rawData.role || 'user',
        storeId: safeId(rawData.storeId), // Handles Reference objects safely
        permissions: safePermissions(rawData.permissions),
        createdAt: rawData.createdAt?.toDate 
            ? rawData.createdAt.toDate().toISOString() 
            : String(rawData.createdAt || new Date().toISOString())
      };

      // Double check sanitization
      setCurrentUser(sanitizeUser(userData));
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: 'Connection error' };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const deleteUser = async (id: string) => {
      try {
          await deleteDoc(doc(db, 'users', id));
      } catch (e) { console.error(e); }
  };

  // --- DATA OPERATIONS ---
  
  const updateStoreSettings = async (data: { name: string }) => {
     if (!currentUser?.storeId) return;
     const storeId = safeId(currentUser.storeId);
     try {
        await setDoc(doc(db, 'stores', storeId), data, { merge: true });
     } catch(e) {
        console.error(e);
     }
  };

  const addWithStoreId = async (collectionName: string, data: any) => {
      if (!currentUser?.storeId) return;
      const storeId = safeId(currentUser.storeId);
      try {
          await addDoc(collection(db, collectionName), { ...data, storeId });
      } catch (e) { console.error(e); }
  };

  const addProduct = (product: Omit<Product, 'id' | 'storeId'>) => addWithStoreId('products', product);
  const addContact = (contact: Omit<Contact, 'id' | 'storeId'>) => addWithStoreId('contacts', contact);
  const addInvoice = (invoice: Omit<Invoice, 'id' | 'storeId'>) => addWithStoreId('invoices', invoice);
  const addExpense = (expense: Omit<Expense, 'id' | 'storeId'>) => addWithStoreId('expenses', expense);
  const addBond = (bond: Omit<Bond, 'id' | 'storeId'>) => addWithStoreId('bonds', bond);
  const addAccount = (account: Omit<Account, 'id' | 'storeId'>) => addWithStoreId('accounts', account);

  // Updates & Deletes (Standard by ID)
  const updateProduct = async (product: Product) => {
    const { id, ...data } = product;
    try { await updateDoc(doc(db, 'products', id), data as any); } catch(e) { console.error(e); }
  };
  const deleteProduct = async (id: string) => { try { await deleteDoc(doc(db, 'products', id)); } catch(e) {} };

  const updateContact = async (contact: Contact) => { const { id, ...data } = contact; try { await updateDoc(doc(db, 'contacts', id), data as any); } catch(e) {} };
  const deleteContact = async (id: string) => { try { await deleteDoc(doc(db, 'contacts', id)); } catch(e) {} };

  const updateInvoice = async (invoice: Invoice) => { const { id, ...data } = invoice; try { await updateDoc(doc(db, 'invoices', id), data as any); } catch(e) {} };
  const deleteInvoice = async (id: string) => { try { await deleteDoc(doc(db, 'invoices', id)); } catch(e) {} };

  const updateExpense = async (expense: Expense) => { const { id, ...data } = expense; try { await updateDoc(doc(db, 'expenses', id), data as any); } catch(e) {} };
  const deleteExpense = async (id: string) => { try { await deleteDoc(doc(db, 'expenses', id)); } catch(e) {} };

  const updateBond = async (bond: Bond) => { const { id, ...data } = bond; try { await updateDoc(doc(db, 'bonds', id), data as any); } catch(e) {} };
  const deleteBond = async (id: string) => { try { await deleteDoc(doc(db, 'bonds', id)); } catch(e) {} };

  const updateAccount = async (account: Account) => { const { id, ...data } = account; try { await updateDoc(doc(db, 'accounts', id), data as any); } catch(e) {} };
  const deleteAccount = async (id: string) => { try { await deleteDoc(doc(db, 'accounts', id)); } catch(e) {} };

  // --- Reset Data ---
  const resetData = async () => {
    if (!currentUser?.storeId) return;
    
    const storeId = safeId(currentUser.storeId);
    const collectionsToClear = ['products', 'contacts', 'invoices', 'expenses', 'bonds', 'accounts'];
    
    try {
        const batch = writeBatch(db);
        let count = 0;

        for (const colName of collectionsToClear) {
            const q = query(collection(db, colName), where('storeId', '==', storeId));
            const snapshot = await getDocs(q);
            
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
                count++;
            });
        }
        
        if (count > 0) {
            await batch.commit();
        }
        
        // Re-seed accounts
        const newBatch = writeBatch(db);
        DEFAULT_ACCOUNTS_TEMPLATE.forEach(acc => {
            const docRef = doc(collection(db, 'accounts'));
            newBatch.set(docRef, { ...acc, storeId });
        });
        await newBatch.commit();
        
    } catch (e) {
        console.error("Error clearing data:", e);
        throw e;
    }
  };

  return (
    <DataContext.Provider value={{
      currentUser, storeName,
      products, contacts, invoices, expenses, bonds, accounts, currency, setCurrency,
      users, registerStore, addEmployee, loginUser, logoutUser, deleteUser,
      updateStoreSettings,
      addProduct, updateProduct, deleteProduct,
      addContact, updateContact, deleteContact,
      addInvoice, updateInvoice, deleteInvoice,
      addExpense, updateExpense, deleteExpense,
      addBond, updateBond, deleteBond,
      addAccount, updateAccount, deleteAccount,
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
