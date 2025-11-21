
import { Product, Contact, Invoice, Stats, Expense, Bond } from './types';

export const MOCK_STATS: Stats = {
  sales: 0,
  purchases: 0,
  expenses: 0,
  balance: 0,
  profit: 0
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    code: 'IP-15-PM-256',
    name: 'آيفون 15 برو ماكس - 256 جيجا - تيتانيوم طبيعي',
    category: 'هواتف ذكية',
    priceBuy: 4200,
    priceSell: 4850,
    stock: 12,
    minStock: 3,
    maxStock: 50,
    unit: 'حبة',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-select?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692879274228',
    description: 'أحدث هاتف من آبل مع شريحة A17 Pro',
    barcode: '194253123456'
  },
  {
    id: 'p2',
    code: 'SAM-S24-ULTRA',
    name: 'سامسونج جالكسي S24 ألترا - 512 جيجا - أسود',
    category: 'هواتف ذكية',
    priceBuy: 3800,
    priceSell: 4400,
    stock: 8,
    minStock: 2,
    unit: 'حبة',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/sa/2401/gallery/sa-galaxy-s24-s928-sm-s928bzkqmea-539323557?$650_519_PNG$',
    description: 'هاتف الذكاء الاصطناعي الجديد من سامسونج',
    barcode: '880609123456'
  },
  {
    id: 'p3',
    code: 'AIRPODS-PRO2',
    name: 'سماعات آبل إيربودز برو (الجيل الثاني)',
    category: 'إكسسوارات',
    priceBuy: 750,
    priceSell: 920,
    stock: 25,
    minStock: 5,
    unit: 'حبة',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361',
    barcode: '195949123456'
  },
  {
    id: 'p4',
    code: 'ANKER-20W',
    name: 'شاحن أنكر 20 واط - منفذ PD',
    category: 'إكسسوارات',
    priceBuy: 45,
    priceSell: 85,
    stock: 150,
    minStock: 20,
    unit: 'حبة',
    image: 'https://m.media-amazon.com/images/I/51I058pE+IL._AC_SX679_.jpg',
    barcode: '681234567890'
  },
  {
    id: 'p5',
    code: 'MAC-AIR-M2',
    name: 'ماك بوك إير M2 - 13 بوصة - لون كحلي',
    category: 'لابتوب',
    priceBuy: 3600,
    priceSell: 4200,
    stock: 4,
    minStock: 1,
    unit: 'حبة',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653084303665',
    barcode: '194253987654'
  },
  {
    id: 'p6',
    code: 'IPAD-AIR-5',
    name: 'آيباد إير الجيل الخامس - 64 جيجا - واي فاي',
    category: 'أجهزة لوحية',
    priceBuy: 2100,
    priceSell: 2500,
    stock: 10,
    minStock: 3,
    unit: 'حبة',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-select-wifi-blue-202203?wid=940&hei=1112&fmt=png-alpha&.v=1645065732688',
    barcode: '194252345678'
  }
];

export const MOCK_CONTACTS: Contact[] = [
  { 
    id: '0', 
    name: 'عميل عام', 
    phone: '000000000', 
    email: '', 
    address: '', 
    balance: 0, 
    creditLimit: 0,
    status: 'active', 
    type: 'customer' 
  },
  {
    id: 'c1',
    name: 'محمد أحمد عبدالله',
    phone: '0551234567',
    email: 'mohammed@example.com',
    address: 'الرياض، حي العليا',
    balance: 500,
    creditLimit: 5000,
    status: 'active',
    type: 'customer'
  },
  {
    id: 'c2',
    name: 'مؤسسة النور للتجارة',
    phone: '0112345678',
    email: 'sales@alnoor-tech.com',
    address: 'جدة، شارع فلسطين',
    balance: -15000, // We owe them
    status: 'active',
    type: 'supplier',
    taxNumber: '300123456700003'
  },
  {
    id: 'c3',
    name: 'شركة التقنية الحديثة',
    phone: '0509876543',
    email: 'contact@moderntech.com',
    address: 'الدمام',
    balance: 0,
    status: 'active',
    type: 'supplier'
  },
  {
    id: 'c4',
    name: 'سارة علي',
    phone: '0540001111',
    email: 'sarah@example.com',
    address: 'الرياض',
    balance: 0,
    status: 'active',
    type: 'customer'
  }
];

export const MOCK_INVOICES: Invoice[] = [
  // Purchase Invoice (Stock in)
  {
    id: 'inv-p-1',
    number: 'PUR-0001',
    date: '2024-02-15',
    dueDate: '2024-03-15',
    contactName: 'مؤسسة النور للتجارة',
    contactId: 'c2',
    total: 42000,
    tax: 0,
    paidAmount: 27000,
    remainingAmount: 15000,
    status: 'pending',
    type: 'purchase',
    itemsCount: 10,
    items: [
      { productId: 'p1', productName: 'آيفون 15 برو ماكس', quantity: 10, price: 4200, discount: 0, total: 42000 }
    ]
  },
  // Sale Invoice 1 (Credit)
  {
    id: 'inv-s-1',
    number: 'INV-1001',
    date: '2024-02-20',
    dueDate: '2024-02-28',
    contactName: 'محمد أحمد عبدالله',
    contactId: 'c1',
    total: 5350, 
    tax: 0,
    paidAmount: 4850,
    remainingAmount: 500,
    status: 'credit',
    type: 'sale',
    itemsCount: 2,
    items: [
      { productId: 'p1', productName: 'آيفون 15 برو ماكس', quantity: 1, price: 4850, discount: 0, total: 4850 },
      { productId: 'p4', productName: 'شاحن أنكر 20 واط', quantity: 2, price: 250, discount: 0, total: 500 } // Simplified item
    ]
  },
  // Sale Invoice 2 (Cash)
  {
    id: 'inv-s-2',
    number: 'INV-1002',
    date: new Date().toISOString().split('T')[0], // Today
    contactName: 'عميل عام',
    contactId: '0',
    total: 920,
    tax: 0,
    paidAmount: 920,
    remainingAmount: 0,
    status: 'paid',
    type: 'sale',
    itemsCount: 1,
    items: [
        { productId: 'p3', productName: 'سماعات آبل إيربودز برو', quantity: 1, price: 920, discount: 0, total: 920 }
    ]
  }
];

export const MOCK_EXPENSES: Expense[] = [
    {
        id: 'exp1',
        title: 'إيجار المعرض - فبراير',
        amount: 5000,
        category: 'Rent',
        date: '2024-02-01',
        description: 'دفعة إيجار شهر فبراير 2024'
    },
    {
        id: 'exp2',
        title: 'فاتورة كهرباء',
        amount: 450,
        category: 'Utilities',
        date: '2024-02-25',
    },
    {
        id: 'exp3',
        title: 'ضيافة ومشروبات',
        amount: 150,
        category: 'Other',
        date: '2024-02-10',
    }
];

export const MOCK_BONDS: Bond[] = [
    {
        id: 'b1',
        number: 'BOND-1001',
        type: 'payment',
        date: '2024-02-15',
        entityType: 'supplier',
        entityId: 'c2',
        entityName: 'مؤسسة النور للتجارة',
        amount: 27000,
        paymentMethod: 'bank',
        notes: 'دفعة من الحساب مقابل فاتورة PUR-0001'
    },
    {
        id: 'b2',
        number: 'BOND-1002',
        type: 'receipt',
        date: '2024-02-20',
        entityType: 'customer',
        entityId: 'c1',
        entityName: 'محمد أحمد عبدالله',
        amount: 4850,
        paymentMethod: 'cash',
        notes: 'سداد قيمة آيفون 15'
    }
];

export const CHART_DATA = [];
