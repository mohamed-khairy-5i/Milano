
import React, { useState } from 'react';
import { Plus, Save, Search, Trash2, Edit, Printer } from 'lucide-react';
import { useData } from '../DataContext';
import { Contact } from '../types';
import Modal from './Modal';

interface ContactsProps {
  isRTL: boolean;
  type: 'customer' | 'supplier';
}

const Contacts: React.FC<ContactsProps> = ({ isRTL, type }) => {
  const { contacts, addContact, updateContact, deleteContact, currency } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Partial<Contact>>({});
  const [isEditing, setIsEditing] = useState(false);

  const title = type === 'customer' ? (isRTL ? 'العملاء' : 'Customers') : (isRTL ? 'الموردين' : 'Suppliers');
  const addLabel = type === 'customer' ? (isRTL ? 'إنشاء عميل' : 'Create Client') : (isRTL ? 'إنشاء مورد' : 'Create Supplier');

  const filteredContacts = contacts.filter(c => 
    c.type === type && 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.phone.includes(searchTerm))
  );

  const handleOpenAdd = () => {
    setCurrentContact({
      name: '',
      phone: '',
      email: '',
      address: '',
      balance: 0,
      creditLimit: 0,
      taxNumber: '',
      notes: '',
      status: 'active',
      type: type
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentContact({ ...contact });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
        deleteContact(id);
    }
  };

  const handleSave = () => {
    if (!currentContact.name) return;

    if (isEditing && currentContact.id) {
      updateContact(currentContact as Contact);
    } else {
      addContact(currentContact as Omit<Contact, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handlePrintList = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=600');
    if (!printWindow) {
        alert(isRTL ? 'يرجى السماح بالنوافذ المنبثقة' : 'Please allow popups');
        return;
    }
    
    const direction = isRTL ? 'rtl' : 'ltr';
    const textAlign = isRTL ? 'right' : 'left';

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
          <title>${title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Cairo', sans-serif; padding: 20px; }
              h2 { text-align: center; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th { background: #f3f4f6; padding: 10px; text-align: ${textAlign}; border-bottom: 2px solid #ccc; }
              td { padding: 10px; border-bottom: 1px solid #eee; }
              @media print { .print-btn { display: none; } }
          </style>
      </head>
      <body>
          <h2>${title}</h2>
          <table>
              <thead>
                  <tr>
                      <th>${isRTL ? 'الاسم' : 'Name'}</th>
                      <th>${isRTL ? 'الهاتف' : 'Phone'}</th>
                      <th>${isRTL ? 'البريد الإلكتروني' : 'Email'}</th>
                      <th>${isRTL ? 'الرصيد' : 'Balance'}</th>
                      ${type === 'customer' ? `<th>${isRTL ? 'حد الائتمان' : 'Credit Limit'}</th>` : ''}
                  </tr>
              </thead>
              <tbody>
                  ${filteredContacts.map(c => `
                      <tr>
                          <td>${c.name}</td>
                          <td>${c.phone}</td>
                          <td>${c.email || '-'}</td>
                          <td>${c.balance.toLocaleString()}</td>
                          ${type === 'customer' ? `<td>${c.creditLimit || 0}</td>` : ''}
                      </tr>
                  `).join('')}
              </tbody>
          </table>
          <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrintRow = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) return;

    const direction = isRTL ? 'rtl' : 'ltr';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
          <title>${contact.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Cairo', sans-serif; padding: 40px; }
              .card { border: 1px solid #ddd; padding: 20px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
              .label { font-weight: bold; color: #555; }
              h2 { text-align: center; margin-top: 0; }
          </style>
      </head>
      <body>
          <div class="card">
              <h2>${contact.name}</h2>
              <div class="row"><span class="label">${isRTL ? 'الهاتف' : 'Phone'}</span><span>${contact.phone}</span></div>
              <div class="row"><span class="label">${isRTL ? 'البريد' : 'Email'}</span><span>${contact.email || '-'}</span></div>
              <div class="row"><span class="label">${isRTL ? 'العنوان' : 'Address'}</span><span>${contact.address || '-'}</span></div>
              <div class="row"><span class="label">${isRTL ? 'الرقم الضريبي' : 'Tax No'}</span><span>${contact.taxNumber || '-'}</span></div>
              <div class="row"><span class="label">${isRTL ? 'الرصيد الحالي' : 'Balance'}</span><span>${contact.balance.toLocaleString()}</span></div>
              ${contact.notes ? `<div class="row"><span class="label">${isRTL ? 'ملاحظات' : 'Notes'}</span><span>${contact.notes}</span></div>` : ''}
          </div>
          <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const formatCurrency = (val: number) => {
    const currencyLabels: Record<string, string> = {
        'YER': isRTL ? 'ريال يمني' : 'YER',
        'SAR': isRTL ? 'ريال سعودي' : 'SAR',
        'USD': isRTL ? 'دولار' : 'USD',
    };
    return `${val.toLocaleString()} ${currencyLabels[currency]}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
       {/* Header Actions */}
       <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
           {title}
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
                    placeholder={isRTL ? "بحث بالاسم أو الهاتف..." : "Search name or phone..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <button 
                onClick={handlePrintList}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm text-sm font-bold shrink-0"
            >
                <Printer size={18} />
                <span className="hidden sm:inline">{isRTL ? 'طباعة' : 'Print'}</span>
            </button>

            <button 
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm font-bold shrink-0"
            >
                <Plus size={18} />
                <span>{addLabel}</span>
            </button>
        </div>
      </div>

      {/* Clean Table */}
      <div className="flex-1 overflow-auto border border-gray-100 dark:border-gray-700 rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
                <thead className="text-xs text-gray-700 uppercase bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-bold">
                    <tr>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الاسم' : 'Name'}</th>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الهاتف' : 'Phone'}</th>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'البريد الإلكتروني' : 'Email'}</th>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الرصيد' : 'Balance'}</th>
                        {type === 'customer' && (
                            <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'حد الائتمان' : 'Credit Limit'}</th>
                        )}
                        <th scope="col" className="px-6 py-4 text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-end">
                                {contact.name}
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-end">
                                {contact.phone}
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-end">
                                {contact.email || '-'}
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-end font-bold dir-ltr">
                                {formatCurrency(contact.balance)}
                            </td>
                            {type === 'customer' && (
                                <td className="px-6 py-4 text-gray-500 text-end">
                                    {formatCurrency(contact.creditLimit || 0)}
                                </td>
                            )}
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button 
                                        onClick={(e) => handleOpenEdit(contact, e)}
                                        className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600"
                                        title={isRTL ? 'تعديل' : 'Edit'}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => handlePrintRow(contact, e)}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                                        title={isRTL ? 'طباعة' : 'Print'}
                                    >
                                        <Printer size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(contact.id, e)}
                                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                                        title={isRTL ? 'حذف' : 'Delete'}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredContacts.length === 0 && (
                        <tr>
                            <td colSpan={type === 'customer' ? 6 : 5} className="px-6 py-8 text-center text-gray-400">
                                {isRTL ? 'لا توجد بيانات' : 'No data'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? (isRTL ? 'تعديل ' + (type === 'customer' ? 'عميل' : 'مورد') : 'Edit ' + (type === 'customer' ? 'Client' : 'Supplier')) : (isRTL ? 'إنشاء ' + (type === 'customer' ? 'عميل' : 'مورد') : 'Create ' + (type === 'customer' ? 'Client' : 'Supplier'))}
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
        <div className="space-y-4">
            {/* Form fields - Same as before */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isRTL ? '* الاسم' : 'Name *'}
                    </label>
                    <input 
                        type="text" 
                        value={currentContact.name || ''}
                        onChange={e => setCurrentContact({...currentContact, name: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isRTL ? 'الهاتف' : 'Phone'}
                    </label>
                    <input 
                        type="text" 
                        value={currentContact.phone || ''}
                        onChange={e => setCurrentContact({...currentContact, phone: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input 
                        type="email" 
                        value={currentContact.email || ''}
                        onChange={e => setCurrentContact({...currentContact, email: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isRTL ? 'الرقم الضريبي' : 'Tax Number'}
                    </label>
                    <input 
                        type="text" 
                        value={currentContact.taxNumber || ''}
                        onChange={e => setCurrentContact({...currentContact, taxNumber: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            {type === 'customer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {isRTL ? 'حد الائتمان' : 'Credit Limit'}
                        </label>
                        <input 
                            type="number" 
                            value={currentContact.creditLimit || ''}
                            onChange={e => setCurrentContact({...currentContact, creditLimit: Number(e.target.value)})}
                            className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                        />
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? 'العنوان' : 'Address'}
                </label>
                <input 
                    type="text" 
                    value={currentContact.address || ''}
                    onChange={e => setCurrentContact({...currentContact, address: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea 
                    value={currentContact.notes || ''}
                    onChange={e => setCurrentContact({...currentContact, notes: e.target.value})}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Contacts;
