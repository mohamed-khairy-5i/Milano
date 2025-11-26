
import React, { useState } from 'react';
import { Plus, Filter, Trash2, FileText, Search, Printer, Edit } from 'lucide-react';
import { Bond } from '../types';
import { useData } from '../DataContext';
import Modal from './Modal';

interface BondsProps {
  isRTL: boolean;
}

const Bonds: React.FC<BondsProps> = ({ isRTL }) => {
  const { bonds, contacts, addBond, updateBond, deleteBond, currency: globalCurrency, storeSettings } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBondData, setNewBondData] = useState<{
    type: 'receipt' | 'payment';
    date: string;
    entityType: 'customer' | 'supplier';
    entityId: string;
    amount: string;
    currency: string;
    paymentMethod: 'cash' | 'bank';
    notes: string;
  }>({
    type: 'receipt',
    date: new Date().toISOString().split('T')[0],
    entityType: 'customer',
    entityId: '',
    amount: '',
    currency: globalCurrency,
    paymentMethod: 'cash',
    notes: ''
  });

  const filteredBonds = bonds.filter(b => 
    b.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.entityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group totals by currency for proper display
  const totalsByCurrency = filteredBonds.reduce((acc, bond) => {
      const curr = bond.currency || globalCurrency;
      if (!acc[curr]) {
          acc[curr] = { receipt: 0, payment: 0 };
      }
      if (bond.type === 'receipt') {
          acc[curr].receipt += bond.amount;
      } else {
          acc[curr].payment += bond.amount;
      }
      return acc;
  }, {} as Record<string, { receipt: number, payment: number }>);

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewBondData({
        type: 'receipt',
        date: new Date().toISOString().split('T')[0],
        entityType: 'customer',
        entityId: '',
        amount: '',
        currency: globalCurrency,
        paymentMethod: 'cash',
        notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (bond: Bond, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(bond.id);
    setNewBondData({
        type: bond.type,
        date: bond.date,
        entityType: bond.entityType,
        entityId: bond.entityId,
        amount: bond.amount.toString(),
        currency: bond.currency || globalCurrency,
        paymentMethod: bond.paymentMethod,
        notes: bond.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!newBondData.amount || !newBondData.entityId) return;

    const selectedContact = contacts.find(c => c.id === newBondData.entityId);

    const bondPayload = {
        type: newBondData.type,
        date: newBondData.date,
        entityType: newBondData.entityType,
        entityId: newBondData.entityId,
        entityName: selectedContact?.name || 'Unknown',
        amount: Number(newBondData.amount),
        currency: newBondData.currency,
        paymentMethod: newBondData.paymentMethod,
        notes: newBondData.notes
    };

    if (editingId) {
        // Update
        const originalBond = bonds.find(b => b.id === editingId);
        if (originalBond) {
            updateBond({
                id: editingId,
                storeId: originalBond.storeId,
                number: originalBond.number || '',
                ...bondPayload
            });
        }
    } else {
        // Create
        addBond({
          number: `BOND-${Date.now().toString().substr(-4)}`,
          ...bondPayload
        });
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      deleteBond(id);
    }
  };

  const currencyLabels: Record<string, string> = {
      'YER': isRTL ? 'ريال يمني' : 'YER',
      'SAR': isRTL ? 'ريال سعودي' : 'SAR',
      'USD': isRTL ? 'دولار' : 'USD',
      'AED': isRTL ? 'درهم إماراتي' : 'AED',
  };

  const formatCurrency = (val: number, curr: string) => {
    return `${val.toLocaleString()} ${currencyLabels[curr] || curr}`;
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) return;

    const direction = isRTL ? 'rtl' : 'ltr';
    const textAlign = isRTL ? 'right' : 'left';

    // Generate totals HTML
    const totalsHtml = Object.entries(totalsByCurrency).map(([curr, amounts]) => {
        const safeAmounts = amounts as { receipt: number, payment: number };
        const net = safeAmounts.receipt - safeAmounts.payment;
        return `
            <tr class="total-row">
                <td colspan="5" style="text-align: center;">${isRTL ? 'الإجمالي' : 'Total'} (${currencyLabels[curr] || curr})</td>
                <td style="color: green;">${safeAmounts.receipt.toLocaleString()}</td>
                <td style="color: red;">${safeAmounts.payment.toLocaleString()}</td>
                <td style="color: ${net >= 0 ? 'blue' : 'orange'}; font-weight: bold;">${net.toLocaleString()}</td>
            </tr>
        `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
          <title>${isRTL ? 'تقرير السندات' : 'Bonds Report'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Cairo', sans-serif; padding: 20px; }
              h2 { text-align: center; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px; }
              th { background: #f3f4f6; padding: 10px; text-align: ${textAlign}; border-bottom: 2px solid #ccc; }
              td { padding: 8px; border-bottom: 1px solid #eee; }
              .total-row { font-weight: bold; background: #f9fafb; border-top: 2px solid #ddd; }
              .receipt { color: green; }
              .payment { color: red; }
              @media print { .print-btn { display: none; } }
          </style>
      </head>
      <body>
          <button class="print-btn" onclick="window.print()" style="padding: 10px 20px; margin-bottom: 20px; cursor: pointer;">${isRTL ? 'طباعة التقرير' : 'Print Report'}</button>
          <h2>${isRTL ? 'تقرير السندات المالية' : 'Financial Bonds Report'}</h2>
          <div>${isRTL ? 'تاريخ التقرير: ' : 'Date: '} ${new Date().toLocaleString()}</div>
          
          <table>
              <thead>
                  <tr>
                      <th>${isRTL ? 'الكود' : 'Code'}</th>
                      <th>${isRTL ? 'رقم السند' : 'Bond #'}</th>
                      <th>${isRTL ? 'التاريخ' : 'Date'}</th>
                      <th>${isRTL ? 'الجهة' : 'Entity'}</th>
                      <th>${isRTL ? 'النوع' : 'Type'}</th>
                      <th>${isRTL ? 'قبض' : 'Receipt'}</th>
                      <th>${isRTL ? 'صرف' : 'Payment'}</th>
                      <th>${isRTL ? 'العملة' : 'Currency'}</th>
                  </tr>
              </thead>
              <tbody>
                  ${filteredBonds.map((bond, index) => `
                      <tr>
                          <td>${index + 1}</td>
                          <td>${bond.number}</td>
                          <td>${bond.date}</td>
                          <td>${bond.entityName}</td>
                          <td>
                              ${isRTL ? (bond.paymentMethod === 'cash' ? 'نقدي' : 'بنك') : bond.paymentMethod}
                          </td>
                          <td style="color: green; font-weight: bold;">${bond.type === 'receipt' ? bond.amount.toLocaleString() : '-'}</td>
                          <td style="color: red; font-weight: bold;">${bond.type === 'payment' ? bond.amount.toLocaleString() : '-'}</td>
                          <td>${currencyLabels[bond.currency || globalCurrency] || bond.currency}</td>
                      </tr>
                  `).join('')}
              </tbody>
              <tfoot>
                  ${totalsHtml}
              </tfoot>
          </table>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };


  const handlePrint = (bond: Bond, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const printWindow = window.open('', '_blank', 'width=900,height=600');
    if (!printWindow) {
        alert(isRTL ? 'يرجى السماح بالنوافذ المنبثقة للطباعة' : 'Please allow popups to print');
        return;
    }
    
    const bondCurrency = bond.currency || globalCurrency;
    const currencySymbol = currencyLabels[bondCurrency] || bondCurrency;
    const direction = isRTL ? 'rtl' : 'ltr';
    const title = bond.type === 'receipt' 
        ? (isRTL ? 'سند قبض' : 'RECEIPT VOUCHER') 
        : (isRTL ? 'سند صرف' : 'PAYMENT VOUCHER');

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
          <title>${title} #${bond.number}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Cairo', sans-serif; background: #f0f0f0; padding: 20px; }
              .bond-container { background: white; max-width: 800px; margin: 0 auto; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .title { font-size: 24px; font-weight: bold; color: #444; background: #f3f4f6; display: inline-block; padding: 10px 30px; border-radius: 5px; border: 1px solid #e5e7eb; }
              .content { margin-bottom: 40px; line-height: 2; font-size: 16px; }
              .row { display: flex; margin-bottom: 15px; border-bottom: 1px dashed #ddd; padding-bottom: 5px; }
              .label { font-weight: bold; width: 150px; color: #666; }
              .value { flex: 1; font-weight: bold; color: #000; }
              .amount-box { border: 2px solid #333; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 30px 0; background: #f9fafb; border-radius: 8px; }
              .footer { display: flex; justify-content: space-between; margin-top: 80px; padding-top: 20px; }
              .signature { text-align: center; width: 200px; border-top: 1px solid #333; padding-top: 10px; }
              .print-btn { display: block; width: 100%; padding: 15px; background: #2563eb; color: white; border: none; cursor: pointer; font-size: 16px; font-weight: bold; margin-bottom: 20px; border-radius: 8px; }
              .print-btn:hover { background: #1d4ed8; }
              @media print {
                  body { background: white; padding: 0; }
                  .bond-container { box-shadow: none; padding: 20px; }
                  .print-btn { display: none; }
              }
          </style>
      </head>
      <body>
          <div class="bond-container">
              <button class="print-btn" onclick="window.print()">${isRTL ? 'طباعة / حفظ PDF' : 'Print / Save as PDF'}</button>
              
              <div class="header">
                  <div class="logo">${storeSettings.name}</div>
                  <div>${storeSettings.address} | ${storeSettings.phone}</div>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                  <div class="title">${title}</div>
              </div>

              <div class="content">
                  <div class="row">
                      <span class="label">${isRTL ? 'رقم السند' : 'Number'}:</span>
                      <span class="value"># ${bond.number}</span>
                      <span class="label">${isRTL ? 'التاريخ' : 'Date'}:</span>
                      <span class="value">${bond.date}</span>
                  </div>
                  <div class="row">
                      <span class="label">${isRTL ? (bond.type === 'receipt' ? 'استلمنا من' : 'صرفنا إلى') : (bond.type === 'receipt' ? 'Received From' : 'Paid To')}:</span>
                      <span class="value">${bond.entityName}</span>
                  </div>
                  <div class="row">
                      <span class="label">${isRTL ? 'طريقة الدفع' : 'Payment Method'}:</span>
                      <span class="value">${isRTL ? (bond.paymentMethod === 'cash' ? 'نقدي' : 'تحويل بنكي') : bond.paymentMethod.toUpperCase()}</span>
                  </div>
                  ${bond.notes ? `
                  <div class="row">
                      <span class="label">${isRTL ? 'وذلك مقابل' : 'For'}:</span>
                      <span class="value">${bond.notes}</span>
                  </div>
                  ` : ''}
              </div>

              <div class="amount-box">
                  ${bond.amount.toLocaleString()} ${currencySymbol}
              </div>

              <div class="footer">
                  <div class="signature">
                      ${isRTL ? 'المحاسب' : 'Accountant'}
                  </div>
                  <div class="signature">
                      ${isRTL ? 'المستلم' : 'Recipient'}
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
                onClick={handlePrintReport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm text-sm font-bold shrink-0"
            >
                <FileText size={18} />
                <span className="hidden sm:inline">{isRTL ? 'طباعة تقرير' : 'Print Report'}</span>
            </button>

            <button 
                onClick={handleOpenAdd}
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
                    <th scope="col" className="px-6 py-4 text-start w-16">{isRTL ? 'الكود' : 'Code'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'رقم السند' : 'Bond #'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'نوع السند' : 'Type'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'التاريخ' : 'Date'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الجهة' : 'Entity'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'المبلغ' : 'Amount'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'طريقة الدفع' : 'Method'}</th>
                    <th scope="col" className="px-6 py-4 text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filteredBonds.map((bond, index) => (
                    <tr key={bond.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-start">
                            {index + 1}
                        </td>
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
                        <td className="px-6 py-4 text-end font-bold text-gray-900 dark:text-white dir-ltr">
                            {formatCurrency(bond.amount, bond.currency || globalCurrency)}
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
                                    onClick={(e) => handleEdit(bond, e)}
                                    className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600"
                                    title={isRTL ? 'تعديل' : 'Edit'}
                                    type="button"
                                >
                                    <Edit size={16} />
                                </button>
                                <button 
                                    onClick={(e) => handlePrint(bond, e)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                                    title={isRTL ? 'طباعة' : 'Print'}
                                    type="button"
                                >
                                    <Printer size={16} />
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(bond.id, e)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                                    title={isRTL ? 'حذف' : 'Delete'}
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {filteredBonds.length === 0 && (
                    <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                            {isRTL ? 'لا توجد سندات' : 'No bonds found'}
                        </td>
                    </tr>
                )}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-900/50 font-bold border-t border-gray-200 dark:border-gray-700">
                {Object.entries(totalsByCurrency).map(([curr, amounts]) => {
                    const safeAmounts = amounts as { receipt: number, payment: number };
                    return (
                    <tr key={curr}>
                        <td colSpan={5} className="px-6 py-3 text-end font-bold">
                            {isRTL ? 'الإجمالي' : 'Total'} <span className="text-xs font-normal bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 mx-2">{currencyLabels[curr]}</span>
                        </td>
                        <td className="px-6 py-3 text-end font-bold text-green-600">
                            {safeAmounts.receipt > 0 ? '+' + safeAmounts.receipt.toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-3 text-end font-bold text-red-600">
                             {safeAmounts.payment > 0 ? '-' + safeAmounts.payment.toLocaleString() : '-'}
                        </td>
                        <td></td>
                    </tr>
                )})}
            </tfoot>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? (isRTL ? 'تعديل سند' : 'Edit Bond') : (isRTL ? 'إنشاء سند جديد' : 'Create New Bond')}
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
         {/* Modal Form Content */}
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

            <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'العملة' : 'Currency'}</label>
                    <select 
                        value={newBondData.currency}
                        onChange={e => setNewBondData({ ...newBondData, currency: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    >
                        <option value="YER">{isRTL ? 'ريال يمني' : 'YER'}</option>
                        <option value="SAR">{isRTL ? 'ريال سعودي' : 'SAR'}</option>
                        <option value="USD">{isRTL ? 'دولار أمريكي' : 'USD'}</option>
                        <option value="AED">{isRTL ? 'درهم إماراتي' : 'AED'}</option>
                    </select>
                </div>
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
