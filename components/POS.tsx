
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  User, 
  Printer, 
  Monitor, 
  History, 
  LayoutGrid, 
  ArrowRight, 
  LogOut, 
  FileText, 
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { useData } from '../DataContext';
import { Product, CartItem, Invoice } from '../types';

interface POSProps {
  isRTL: boolean;
}

type POSView = 'dashboard' | 'terminal' | 'history';

const POS: React.FC<POSProps> = ({ isRTL }) => {
  const [view, setView] = useState<POSView>('dashboard');

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {view === 'dashboard' && <POSDashboard isRTL={isRTL} onViewChange={setView} />}
      {view === 'terminal' && <POSTerminal isRTL={isRTL} onExit={() => setView('dashboard')} />}
      {view === 'history' && <POSHistory isRTL={isRTL} onBack={() => setView('dashboard')} />}
    </div>
  );
};

// --- 1. DASHBOARD COMPONENT ---
const POSDashboard: React.FC<{ isRTL: boolean; onViewChange: (v: POSView) => void }> = ({ isRTL, onViewChange }) => {
    const { invoices, currency } = useData();

    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    const todaysInvoices = invoices.filter(i => i.type === 'sale' && i.date === today && i.status !== 'cancelled');
    const todayTotal = todaysInvoices.reduce((sum, i) => sum + i.total, 0);
    const todayCount = todaysInvoices.length;

    const currencyLabels: Record<string, string> = {
        'YER': isRTL ? 'ريال يمني' : 'YER',
        'SAR': isRTL ? 'ريال سعودي' : 'SAR',
        'USD': isRTL ? 'دولار' : 'USD',
    };
    const currencyLabel = currencyLabels[currency];

    return (
        <div className="p-6 max-w-6xl mx-auto h-full flex flex-col animate-fade-in">
            <div className="mb-8 text-center md:text-start">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{isRTL ? 'نقطة البيع' : 'Point of Sale'}</h2>
                <p className="text-gray-500 dark:text-gray-400">{isRTL ? 'اختر إجراء للمتابعة' : 'Select an action to proceed'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Enter POS Card */}
                <div 
                    onClick={() => onViewChange('terminal')}
                    className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all cursor-pointer flex flex-col items-center text-center"
                >
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Monitor size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{isRTL ? 'تسجيل الدخول لنقطة البيع' : 'Open POS Terminal'}</h3>
                    <p className="text-gray-500 text-sm">{isRTL ? 'الدخول لشاشة الكاشير وبدء البيع' : 'Enter cashier mode and start selling'}</p>
                </div>

                {/* History Card */}
                <div 
                    onClick={() => onViewChange('history')}
                    className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center text-center"
                >
                    <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <History size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{isRTL ? 'عرض الإيصالات' : 'View Receipts'}</h3>
                    <p className="text-gray-500 text-sm">{isRTL ? 'سجل المبيعات والفواتير السابقة' : 'Sales history and past invoices'}</p>
                </div>

                {/* Summary Card */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center pointer-events-none">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                        <BarChart3 size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{isRTL ? 'مبيعات اليوم' : "Today's Sales"}</h3>
                    <div className="text-2xl font-bold text-green-600 mt-2 dir-ltr">
                        {todayTotal.toLocaleString()} <span className="text-sm text-gray-500">{currencyLabel}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-2">{todayCount} {isRTL ? 'فاتورة' : 'Invoices'}</p>
                </div>
            </div>

            {/* Recent Activity Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex-1">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-bold text-gray-900 dark:text-white">{isRTL ? 'آخر العمليات' : 'Recent Activity'}</h3>
                </div>
                <div className="overflow-auto max-h-64">
                    <table className="w-full text-sm text-left rtl:text-right">
                        <thead className="bg-white dark:bg-gray-800 text-gray-500 font-medium border-b dark:border-gray-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">{isRTL ? 'رقم الإيصال' : 'Receipt #'}</th>
                                <th className="px-6 py-3">{isRTL ? 'الوقت' : 'Time'}</th>
                                <th className="px-6 py-3">{isRTL ? 'المبلغ' : 'Amount'}</th>
                                <th className="px-6 py-3">{isRTL ? 'الحالة' : 'Status'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {invoices.filter(i => i.type === 'sale').slice(0, 5).map(inv => (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-3 font-medium">{inv.number}</td>
                                    <td className="px-6 py-3 text-gray-500">{inv.date}</td>
                                    <td className="px-6 py-3 font-bold">{inv.total.toLocaleString()}</td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{isRTL ? 'مكتمل' : 'Completed'}</span>
                                    </td>
                                </tr>
                            ))}
                             {invoices.filter(i => i.type === 'sale').length === 0 && (
                                <tr><td colSpan={4} className="p-6 text-center text-gray-400">{isRTL ? 'لا توجد عمليات' : 'No activity'}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- 2. HISTORY COMPONENT ---
const POSHistory: React.FC<{ isRTL: boolean; onBack: () => void }> = ({ isRTL, onBack }) => {
    const { invoices, currency, storeName, contacts } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInvoices = invoices.filter(i => 
        i.type === 'sale' && 
        (i.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
         i.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handlePrint = (invoice: Invoice) => {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) return;

        const currencySymbol = currency;
        const direction = isRTL ? 'rtl' : 'ltr';
        
        const htmlContent = `
        <!DOCTYPE html>
        <html dir="${direction}">
        <head>
            <title>${isRTL ? 'إيصال' : 'Receipt'} #${invoice.number}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                @page { size: 80mm auto; margin: 0; }
                body { font-family: 'Cairo', monospace; padding: 10px 15px; width: 78mm; margin: 0 auto; font-size: 12px; }
                .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                .store-name { font-weight: 900; font-size: 18px; margin: 0; text-transform: uppercase; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: ${isRTL ? 'right' : 'left'}; border-bottom: 1px solid #000; padding: 5px 0; font-size: 11px; }
                td { border-bottom: 1px dashed #ddd; padding: 6px 0; vertical-align: top; }
                .totals { margin-top: 15px; border-top: 2px solid #000; padding-top: 5px; }
                .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
                .final-total { font-weight: 900; font-size: 16px; margin-top: 8px; border-top: 1px solid #000; padding-top: 8px; }
                .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 1px dashed #000; padding-top: 10px; }
                .print-btn { width: 100%; padding: 10px; background: #000; color: #fff; border: none; margin-bottom: 10px; cursor: pointer; font-weight: bold; border-radius: 4px; }
                @media print { .print-btn { display: none; } body { width: auto; } }
            </style>
        </head>
        <body>
             <button class="print-btn" onclick="window.print()">${isRTL ? 'طباعة' : 'Print'}</button>
             <div class="header">
                <div class="store-name">${storeName}</div>
                <div>#${invoice.number}</div>
                <div>${invoice.date}</div>
             </div>
             <table>
                <thead><tr><th width="50%">${isRTL ? 'الصنف' : 'Item'}</th><th width="15%">${isRTL ? 'ك' : 'Q'}</th><th width="35%">${isRTL ? 'السعر' : 'Price'}</th></tr></thead>
                <tbody>
                ${invoice.items?.map(item => `
                    <tr>
                        <td><div style="font-weight: bold;">${item.productName}</div></td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: ${isRTL ? 'left' : 'right'}; font-weight: bold;">${(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                `).join('') || ''}
                </tbody>
             </table>
             <div class="totals">
                <div class="row final-total">
                    <span>${isRTL ? 'الإجمالي' : 'TOTAL'}</span>
                    <span>${invoice.total.toLocaleString()} ${currencySymbol}</span>
                </div>
             </div>
             <div class="footer">
                <div>${isRTL ? 'نسخة من الإيصال' : 'Receipt Copy'}</div>
             </div>
        </body>
        </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="bg-white dark:bg-gray-800 h-full flex flex-col animate-fade-in">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isRTL ? 'سجل الإيصالات' : 'Receipts History'}</h2>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400"><Search size={18} /></div>
                    <input 
                        type="text" 
                        className="block w-64 p-2 ps-10 text-sm border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        placeholder={isRTL ? "بحث..." : "Search..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
                <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-6 py-3">{isRTL ? 'الإيصال' : 'Receipt'}</th>
                            <th className="px-6 py-3">{isRTL ? 'التاريخ' : 'Date'}</th>
                            <th className="px-6 py-3">{isRTL ? 'العميل' : 'Customer'}</th>
                            <th className="px-6 py-3">{isRTL ? 'المبلغ' : 'Amount'}</th>
                            <th className="px-6 py-3 text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredInvoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{inv.number}</td>
                                <td className="px-6 py-4">{inv.date}</td>
                                <td className="px-6 py-4">{inv.contactName}</td>
                                <td className="px-6 py-4 font-bold">{inv.total.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handlePrint(inv)} className="p-2 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                                        <Printer size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filteredInvoices.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">{isRTL ? 'لا توجد إيصالات' : 'No receipts found'}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- 3. TERMINAL COMPONENT (Original POS Logic) ---
const POSTerminal: React.FC<{ isRTL: boolean; onExit: () => void }> = ({ isRTL, onExit }) => {
  const { products, currency, addInvoice, storeName } = useData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const currencyLabels: Record<string, string> = {
      'YER': isRTL ? 'ريال يمني' : 'YER',
      'SAR': isRTL ? 'ريال سعودي' : 'SAR',
      'USD': isRTL ? 'دولار' : 'USD',
  };
  const currencyLabel = currencyLabels[currency];

  useEffect(() => {
    if (products.length > 0) {
        const results = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(results);
    } else {
        setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.priceSell * item.quantity), 0);
  };

  const calculateTax = (total: number) => total * 0.00; 

  const subTotal = calculateTotal();
  const tax = calculateTax(subTotal);
  const total = subTotal + tax;

  const handlePay = () => {
      if (cart.length === 0) return;
      const invNumber = `POS-${Date.now().toString().substr(-6)}`;
      
      addInvoice({
          number: invNumber,
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
          contactName: isRTL ? 'عميل عام' : 'Walk-in Customer',
          contactId: '0', 
          total: total,
          paidAmount: total,
          remainingAmount: 0,
          tax: tax,
          status: 'paid',
          type: 'sale',
          itemsCount: cart.length,
          items: cart.map(item => ({
              productId: item.id,
              productName: item.name,
              quantity: item.quantity,
              price: item.priceSell,
              discount: 0,
              total: item.quantity * item.priceSell
          }))
      });

      handlePrint(invNumber);
      setCart([]);
  };

  const handlePrint = (invoiceNumber?: string) => {
      if (cart.length === 0) return;
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (!printWindow) {
          alert(isRTL ? 'يرجى السماح بالنوافذ المنبثقة' : 'Please allow popups');
          return;
      }

      const currencySymbol = currency;
      const direction = isRTL ? 'rtl' : 'ltr';
      const displayOrderNo = invoiceNumber || `TEMP-${Math.floor(Math.random() * 1000)}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="${direction}">
        <head>
            <title>${isRTL ? 'فاتورة كاشير' : 'Receipt'}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                @page { size: 80mm auto; margin: 0; }
                body { font-family: 'Cairo', monospace; padding: 10px 15px; width: 78mm; margin: 0 auto; background: #fff; color: #000; font-size: 12px; }
                .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                .store-name { font-weight: 900; font-size: 18px; margin: 0; text-transform: uppercase; }
                .meta { font-size: 11px; margin-top: 4px; color: #333; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: ${isRTL ? 'right' : 'left'}; border-bottom: 1px solid #000; padding: 5px 0; font-size: 11px; }
                td { border-bottom: 1px dashed #ddd; padding: 6px 0; vertical-align: top; }
                .totals { margin-top: 15px; border-top: 2px solid #000; padding-top: 5px; }
                .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
                .final-total { font-weight: 900; font-size: 16px; margin-top: 8px; border-top: 1px solid #000; padding-top: 8px; }
                .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 1px dashed #000; padding-top: 10px; }
                .print-btn { width: 100%; padding: 10px; background: #000; color: #fff; border: none; margin-bottom: 10px; cursor: pointer; font-weight: bold; border-radius: 4px; }
                @media print { .print-btn { display: none; } body { width: auto; } }
            </style>
        </head>
        <body>
             <button class="print-btn" onclick="window.print()">${isRTL ? 'طباعة الفاتورة' : 'Print Receipt'}</button>
             <div class="header">
                <div class="store-name">${storeName}</div>
                <div class="meta">${isRTL ? 'رقم الفاتورة' : 'Invoice'}: #${displayOrderNo}</div>
                <div class="meta">${new Date().toLocaleString()}</div>
             </div>
             <table>
                <thead><tr><th width="50%">${isRTL ? 'الصنف' : 'Item'}</th><th width="15%" style="text-align: center;">${isRTL ? 'كمية' : 'Qty'}</th><th width="35%" style="text-align: ${isRTL ? 'left' : 'right'};">${isRTL ? 'السعر' : 'Price'}</th></tr></thead>
                <tbody>
                ${cart.map(item => `
                    <tr>
                        <td><div style="font-weight: bold;">${item.name}</div></td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: ${isRTL ? 'left' : 'right'}; font-weight: bold;">${(item.priceSell * item.quantity).toLocaleString()}</td>
                    </tr>
                `).join('')}
                </tbody>
             </table>
             <div class="totals">
                <div class="row"><span>${isRTL ? 'المجموع' : 'Subtotal'}</span><span>${subTotal.toLocaleString()}</span></div>
                <div class="row"><span>${isRTL ? 'الضريبة' : 'Tax'}</span><span>${tax.toLocaleString()}</span></div>
                <div class="row final-total"><span>${isRTL ? 'الإجمالي' : 'TOTAL'}</span><span>${total.toLocaleString()} ${currencySymbol}</span></div>
             </div>
             <div class="footer">
                <div>${isRTL ? 'شكراً لزيارتكم!' : 'Thank You for Visiting!'}</div>
             </div>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-4 overflow-hidden">
      
      {/* Products Grid */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Header with Back Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4 items-center bg-gray-50 dark:bg-gray-900/50">
           <button onClick={onExit} className="p-2 rounded-lg bg-white border hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors">
                {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
           </button>
           <div className="relative flex-1">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Search size={18} className="text-gray-400" />
                </div>
                <input 
                type="text" 
                className="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                placeholder={isRTL ? "بحث عن منتج..." : "Search products..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
           </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                    <div 
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="group cursor-pointer bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-primary hover:shadow-md transition-all"
                    >
                        <div className="aspect-square rounded-md overflow-hidden mb-3 bg-white dark:bg-gray-600 flex items-center justify-center">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <span className="text-gray-400 text-xs">{isRTL ? 'لا صورة' : 'No Image'}</span>
                            )}
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{product.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{product.code}</span>
                            <span className="font-bold text-primary text-sm flex items-center gap-1">
                                {product.priceSell.toLocaleString()}
                                <span className="text-[10px] font-normal">{currencyLabel}</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-xl">
            <div className="flex items-center gap-2">
                <User size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'عميل عام' : 'Walk-in Customer'}</span>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{cart.length} {isRTL ? 'عناصر' : 'Items'}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Monitor size={48} className="mb-2 opacity-20" />
                    <p>{isRTL ? 'ابدأ بمسح المنتجات' : 'Start scanning items'}</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</h4>
                            <div className="text-xs text-gray-500 mt-1">
                                {item.priceSell.toLocaleString()} {currencyLabel} x {item.quantity}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:text-red-500"><Minus size={14} /></button>
                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:text-green-500"><Plus size={14} /></button>
                            <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md ml-1"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2">
                    <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                    <span>{total.toLocaleString()} {currencyLabel}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={handlePay} className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg">
                    <CreditCard size={20} /> {isRTL ? 'دفع' : 'Pay'}
                </button>
                <button onClick={() => handlePrint()} className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 transition-colors font-bold">
                    <Printer size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
