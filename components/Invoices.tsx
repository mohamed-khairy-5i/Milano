
import React, { useState } from 'react';
import { Plus, Eye, Trash2, Printer, Filter } from 'lucide-react';
import { Invoice } from '../types';
import { useData } from '../DataContext';
import Modal from './Modal';

interface InvoicesProps {
  isRTL: boolean;
  type?: 'sale' | 'purchase';
}

const Invoices: React.FC<InvoicesProps> = ({ isRTL, type = 'sale' }) => {
  const { invoices, contacts, products, addInvoice, deleteInvoice } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Labels
  const pageTitle = type === 'sale' ? (isRTL ? 'المبيعات' : 'Sales') : (isRTL ? 'المشتريات' : 'Purchases');
  const createBtnLabel = type === 'sale' ? (isRTL ? 'إنشاء فاتورة بيع' : 'Create Sale Invoice') : (isRTL ? 'إنشاء فاتورة شراء' : 'Create Purchase Invoice');
  const contactLabel = type === 'sale' ? (isRTL ? 'العميل' : 'Customer') : (isRTL ? 'المورد' : 'Supplier');
  const selectContactLabel = type === 'sale' ? (isRTL ? 'اختر عميل' : 'Select Customer') : (isRTL ? 'اختر مورد' : 'Select Supplier');
  const priceLabel = type === 'sale' ? (isRTL ? 'سعر البيع' : 'Selling Price') : (isRTL ? 'سعر التكلفة' : 'Cost Price');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState<{
    contactId: string;
    date: string;
    dueDate: string;
    items: { productId: string; quantity: number; price: number; discount: number }[];
    tax: number;
    notes: string;
    currentLineItem: { productId: string; quantity: number; price: number; discount: number };
  }>({
    contactId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    items: [],
    tax: 0,
    notes: '',
    currentLineItem: { productId: '', quantity: 1, price: 0, discount: 0 }
  });

  const filteredInvoices = invoices.filter(inv => 
    (inv.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.contactName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    inv.type === type
  );

  const availableContacts = contacts.filter(c => c.type === (type === 'sale' ? 'customer' : 'supplier'));

  const formatCurrency = (val: number) => {
    return `${val.toLocaleString()} ريال يمني`;
  };

  const handleAddLineItem = () => {
    if (newInvoiceData.currentLineItem.productId) {
      setNewInvoiceData({
        ...newInvoiceData,
        items: [...newInvoiceData.items, newInvoiceData.currentLineItem],
        currentLineItem: { productId: '', quantity: 1, price: 0, discount: 0 }
      });
    }
  };

  const handleSaveInvoice = () => {
    if (!newInvoiceData.contactId) return;

    const selectedContact = contacts.find(c => c.id === newInvoiceData.contactId);
    const totalBeforeTax = newInvoiceData.items.reduce((acc, item) => acc + (item.quantity * item.price) - item.discount, 0);
    const total = totalBeforeTax + newInvoiceData.tax;
    
    const prefix = type === 'sale' ? 'INV' : 'PUR';

    addInvoice({
      number: `${prefix}-${Date.now().toString().substr(-4)}`, 
      date: newInvoiceData.date,
      dueDate: newInvoiceData.dueDate,
      contactName: selectedContact?.name || 'Unknown',
      contactId: newInvoiceData.contactId,
      total: total,
      paidAmount: 0, 
      remainingAmount: total,
      tax: newInvoiceData.tax,
      status: 'pending',
      type: type,
      itemsCount: newInvoiceData.items.length
    });

    setIsModalOpen(false);
    // Reset state
    setNewInvoiceData({
      contactId: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      items: [],
      tax: 0,
      notes: '',
      currentLineItem: { productId: '', quantity: 1, price: 0, discount: 0 }
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
        deleteInvoice(id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
      
      {/* Header */}
      <div className="mb-6 flex flex-row justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
           {pageTitle}
        </h2>

        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm font-bold"
        >
            <Plus size={18} />
            <span>{createBtnLabel}</span>
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-gray-100 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
            <thead className="text-xs text-gray-700 uppercase bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-bold">
                <tr>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'رقم الفاتورة' : 'Invoice #'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{contactLabel}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'التاريخ' : 'Date'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الإجمالي' : 'Total'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'المدفوع' : 'Paid'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'المتبقي' : 'Remaining'}</th>
                    <th scope="col" className="px-6 py-4 text-center">{isRTL ? 'الحالة' : 'Status'}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-end">
                            {invoice.number}
                        </td>
                        <td className="px-6 py-4 text-end">
                            {invoice.contactName}
                        </td>
                        <td className="px-6 py-4 text-end text-gray-500">
                            {invoice.date}
                        </td>
                        <td className="px-6 py-4 text-end font-bold text-gray-900 dark:text-white">
                            {formatCurrency(invoice.total)}
                        </td>
                        <td className="px-6 py-4 text-end text-green-600 font-medium">
                             {formatCurrency(invoice.paidAmount || 0)}
                        </td>
                        <td className="px-6 py-4 text-end text-red-600 font-medium">
                             {formatCurrency(invoice.remainingAmount || 0)}
                        </td>
                        <td className="px-6 py-4 text-center">
                             <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                {isRTL 
                                  ? (invoice.status === 'paid' ? 'مدفوع' : invoice.status === 'pending' ? 'معلق' : 'ملغي')
                                  : invoice.status.toUpperCase()
                                }
                            </span>
                        </td>
                    </tr>
                ))}
                {filteredInvoices.length === 0 && (
                    <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                            {isRTL ? 'لا توجد فواتير' : 'No invoices found'}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={createBtnLabel}
        isRTL={isRTL}
        footer={
            <>
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleSaveInvoice} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-bold">
                    {isRTL ? 'حفظ' : 'Save'}
                </button>
            </>
        }
      >
        <div className="space-y-6 py-2">
            {/* Row 1: Contact (Customer/Supplier) and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{contactLabel}</label>
                    <select
                        value={newInvoiceData.contactId}
                        onChange={e => setNewInvoiceData({ ...newInvoiceData, contactId: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    >
                        <option value="">{selectContactLabel}</option>
                        {availableContacts.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-1">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'التاريخ' : 'Date'}</label>
                    <input 
                        type="date" 
                        value={newInvoiceData.date}
                        onChange={e => setNewInvoiceData({ ...newInvoiceData, date: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            {/* Row 2: Due Date (Full width in row just for spacing, or consistent) */}
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
                <input 
                    type="date" 
                    value={newInvoiceData.dueDate}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>

            {/* Products Section Title (Implicit) */}
            <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{isRTL ? 'المنتجات' : 'Products'}</h4>
                {/* Add Line Item Row */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'المنتج' : 'Product'}</label>
                         <select 
                            value={newInvoiceData.currentLineItem.productId}
                            onChange={e => {
                                const prod = products.find(p => p.id === e.target.value);
                                setNewInvoiceData({
                                    ...newInvoiceData,
                                    currentLineItem: {
                                        ...newInvoiceData.currentLineItem,
                                        productId: e.target.value,
                                        price: prod ? (type === 'sale' ? prod.priceSell : prod.priceBuy) : 0
                                    }
                                })
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-black focus:border-black"
                        >
                            <option value="">{isRTL ? 'اختر منتج' : 'Select Product'}</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-24">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الكمية' : 'Qty'}</label>
                        <input 
                            type="number" 
                            value={newInvoiceData.currentLineItem.quantity}
                            onChange={e => setNewInvoiceData({ ...newInvoiceData, currentLineItem: { ...newInvoiceData.currentLineItem, quantity: Number(e.target.value) }})}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-sm focus:ring-black focus:border-black"
                        />
                    </div>
                     <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{priceLabel}</label>
                        <input 
                            type="number" 
                            value={newInvoiceData.currentLineItem.price}
                            onChange={e => setNewInvoiceData({ ...newInvoiceData, currentLineItem: { ...newInvoiceData.currentLineItem, price: Number(e.target.value) }})}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-sm focus:ring-black focus:border-black"
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الخصم' : 'Discount'}</label>
                        <input 
                            type="number" 
                            value={newInvoiceData.currentLineItem.discount}
                            onChange={e => setNewInvoiceData({ ...newInvoiceData, currentLineItem: { ...newInvoiceData.currentLineItem, discount: Number(e.target.value) }})}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-sm focus:ring-black focus:border-black"
                        />
                    </div>
                    <button 
                        onClick={handleAddLineItem}
                        className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors mb-0.5"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                
                {/* Added Items List (Preview) */}
                {newInvoiceData.items.length > 0 && (
                    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500">
                                <tr>
                                    <th className="px-3 py-2">{isRTL ? 'المنتج' : 'Product'}</th>
                                    <th className="px-3 py-2">{isRTL ? 'الكمية' : 'Qty'}</th>
                                    <th className="px-3 py-2">{isRTL ? 'السعر' : 'Price'}</th>
                                    <th className="px-3 py-2">{isRTL ? 'الإجمالي' : 'Total'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {newInvoiceData.items.map((item, idx) => {
                                    const p = products.find(x => x.id === item.productId);
                                    return (
                                        <tr key={idx}>
                                            <td className="px-3 py-2">{p?.name}</td>
                                            <td className="px-3 py-2">{item.quantity}</td>
                                            <td className="px-3 py-2">{item.price}</td>
                                            <td className="px-3 py-2">{(item.quantity * item.price) - item.discount}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Tax */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'الضريبة' : 'Tax'}</label>
                <input 
                    type="number" 
                    value={newInvoiceData.tax}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, tax: Number(e.target.value) })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>

             {/* Notes */}
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'ملاحظات' : 'Notes'}</label>
                <textarea 
                    rows={3}
                    value={newInvoiceData.notes}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, notes: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>

        </div>
      </Modal>
    </div>
  );
};

export default Invoices;
