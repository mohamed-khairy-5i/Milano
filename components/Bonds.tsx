
import React, { useState } from 'react';
import { Plus, Filter, Trash2, FileText, Search, Printer } from 'lucide-react';
import { Bond } from '../types';
import { useData } from '../DataContext';
import Modal from './Modal';

interface BondsProps {
  isRTL: boolean;
}

const Bonds: React.FC<BondsProps> = ({ isRTL }) => {
  const { bonds, contacts, addBond, deleteBond, currency } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBondData, setNewBondData] = useState<{
    type: 'receipt' | 'payment';
    date: string;
    entityType: 'customer' | 'supplier';
    entityId: string;
    amount: string;
    paymentMethod: 'cash' | 'bank';
    notes: string;
  }>({
    type: 'receipt',
    date: new Date().toISOString().split('T')[0],
    entityType: 'customer',
    entityId: '',
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const filteredBonds = bonds.filter(b => 
    b.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.entityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!newBondData.amount || !newBondData.entityId) return;

    const selectedContact = contacts.find(c => c.id === newBondData.entityId);

    addBond({
      number: `BOND-${Date.now().toString().substr(-4)}`,
      type: newBondData.type,
      date: newBondData.date,
      entityType: newBondData.entityType,
      entityId: newBondData.entityId,
      entityName: selectedContact?.name || 'Unknown',
      amount: Number(newBondData.amount),
      paymentMethod: newBondData.paymentMethod,
      notes: newBondData.notes
    });

    setIsModalOpen(false);
    setNewBondData({
        type: 'receipt',
        date: new Date().toISOString().split('T')[0],
        entityType: 'customer',
        entityId: '',
        amount: '',
        paymentMethod: 'cash',
        notes: ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      deleteBond(id);
    }
  };

  const handlePrint = (id: string) => {
    alert(isRTL ? "جاري طباعة السند: " + id : "Printing Bond: " + id);
  };

  const formatCurrency = (val: number) => {
    const currencyLabels: Record<string, string> = {
        'YER': isRTL ? 'ريال يمني' : 'YER',
        'SAR': isRTL ? 'ريال سعودي' : 'SAR',
        'USD': isRTL ? 'دولار' : 'USD',
    };
    return `${val.toLocaleString()} ${currencyLabels[currency]}`;
  };

  // Filter contacts based on entityType
  const filteredContacts = contacts.filter(c => c.type === newBondData.entityType);

  return (
    <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
           {isRTL ? 'السندات' : 'Bonds'}
        </h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-none">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
                    <Search size={18} />
                </div>
                <input 
                    type="text" 
                    className="block w-full sm:w-64 p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    placeholder={isRTL ? "بحث برقم السند..." : "Search bond #..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm font-bold shrink-0"
            >
                <Plus size={18} />
                <span>{isRTL ? 'إنشاء سند' : 'Create Bond'}</span>
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-gray-100 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
            <thead className="text-xs text-gray-700 uppercase bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-bold">
                <tr>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'رقم السند' : 'Bond #'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'نوع السند' : 'Type'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'التاريخ' : 'Date'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'العميل / المورد' : 'Client / Supplier'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'المبلغ' : 'Amount'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</th>
                    <th scope="col" className="px-6 py-4 text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filteredBonds.map((bond) => (
                    <tr key={bond.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-end">
                            {bond.number}
                        </td>
                        <td className="px-6 py-4 text-end">
                             <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${bond.type === 'receipt' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                {isRTL 
                                  ? (bond.type === 'receipt' ? 'سند قبض' : 'سند صرف')
                                  : (bond.type === 'receipt' ? 'Receipt' : 'Payment')
                                }
                            </span>
                        </td>
                        <td className="px-6 py-4 text-end text-gray-500">
                            {bond.date}
                        </td>
                        <td className="px-6 py-4 text-end">
                            {bond.entityName}
                        </td>
                        <td className="px-6 py-4 text-end font-bold text-gray-900 dark:text-white">
                            {formatCurrency(bond.amount)}
                        </td>
                        <td className="px-6 py-4 text-end">
                            {isRTL 
                                ? (bond.paymentMethod === 'cash' ? 'نقدي' : 'بنك')
                                : (bond.paymentMethod === 'cash' ? 'Cash' : 'Bank')
                            }
                        </td>
                         <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <button 
                                    onClick={() => handlePrint(bond.id)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                                    title={isRTL ? 'طباعة' : 'Print'}
                                >
                                    <Printer size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(bond.id)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                                    title={isRTL ? 'حذف' : 'Delete'}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {filteredBonds.length === 0 && (
                    <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                            {isRTL ? 'لا توجد سندات' : 'No bonds found'}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isRTL ? 'إنشاء سند جديد' : 'Create New Bond'}
        isRTL={isRTL}
        footer={
            <>
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleSave} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-bold">
                    {isRTL ? 'حفظ' : 'Save'}
                </button>
            </>
        }
      >
         {/* Modal Form - Same as before */}
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'نوع السند' : 'Bond Type'}</label>
                    <select 
                        value={newBondData.type}
                        onChange={e => setNewBondData({ ...newBondData, type: e.target.value as 'receipt' | 'payment' })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    >
                        <option value="receipt">{isRTL ? 'سند قبض' : 'Receipt Bond'}</option>
                        <option value="payment">{isRTL ? 'سند صرف' : 'Payment Bond'}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'التاريخ' : 'Date'}</label>
                    <input 
                        type="date" 
                        value={newBondData.date}
                        onChange={e => setNewBondData({ ...newBondData, date: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الجهة' : 'Party Type'}</label>
                    <select 
                        value={newBondData.entityType}
                        onChange={e => setNewBondData({ ...newBondData, entityType: e.target.value as 'customer' | 'supplier', entityId: '' })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    >
                        <option value="customer">{isRTL ? 'العميل' : 'Customer'}</option>
                        <option value="supplier">{isRTL ? 'المورد' : 'Supplier'}</option>
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? (newBondData.entityType === 'customer' ? 'العميل' : 'المورد') : 'Name'}</label>
                     <select 
                        value={newBondData.entityId}
                        onChange={e => setNewBondData({ ...newBondData, entityId: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    >
                        <option value="">{isRTL ? 'اختياري' : 'Select'}</option>
                        {filteredContacts.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'المبلغ' : 'Amount'}</label>
                    <input 
                        type="number" 
                        value={newBondData.amount}
                        onChange={e => setNewBondData({ ...newBondData, amount: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</label>
                    <select 
                        value={newBondData.paymentMethod}
                        onChange={e => setNewBondData({ ...newBondData, paymentMethod: e.target.value as 'cash' | 'bank' })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    >
                        <option value="cash">{isRTL ? 'نقدي' : 'Cash'}</option>
                        <option value="bank">{isRTL ? 'بنك' : 'Bank'}</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'ملاحظات' : 'Notes'}</label>
                <textarea 
                    rows={3}
                    value={newBondData.notes}
                    onChange={e => setNewBondData({ ...newBondData, notes: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bonds;
