
import React, { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { useData } from '../DataContext';
import { Contact } from '../types';
import Modal from './Modal';

interface ContactsProps {
  isRTL: boolean;
  type: 'customer' | 'supplier';
}

const Contacts: React.FC<ContactsProps> = ({ isRTL, type }) => {
  const { contacts, addContact, updateContact, deleteContact } = useData();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Partial<Contact>>({});
  const [isEditing, setIsEditing] = useState(false);

  const title = type === 'customer' ? (isRTL ? 'العملاء' : 'Customers') : (isRTL ? 'الموردين' : 'Suppliers');
  const addLabel = type === 'customer' ? (isRTL ? 'إنشاء عميل' : 'Create Client') : (isRTL ? 'إنشاء مورد' : 'Create Supplier');

  const filteredContacts = contacts.filter(c => c.type === type);

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

  const handleOpenEdit = (contact: Contact) => {
    setCurrentContact({ ...contact });
    setIsEditing(true);
    setIsModalOpen(true);
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

  const formatCurrency = (val: number) => {
    // Match the screenshot format "0 ريال يمني"
    return isRTL ? `${val} ريال يمني` : `${val} YER`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
       {/* Header Actions matching screenshot - Title on right, Button on left */}
       <div className="mb-6 flex flex-row justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
           {title}
        </h2>

        <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm font-bold"
        >
            <Plus size={18} />
            <span>{addLabel}</span>
        </button>
      </div>

      {/* Clean Table matching screenshot */}
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
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group" onClick={() => handleOpenEdit(contact)}>
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-end">
                                {contact.name}
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-end">
                                {contact.phone}
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-end">
                                {contact.email || '-'}
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-end">
                                {formatCurrency(contact.balance)}
                            </td>
                            {type === 'customer' && (
                                <td className="px-6 py-4 text-gray-500 text-end">
                                    {formatCurrency(contact.creditLimit || 0)}
                                </td>
                            )}
                        </tr>
                    ))}
                    {filteredContacts.length === 0 && (
                        <tr>
                            <td colSpan={type === 'customer' ? 5 : 4} className="px-6 py-8 text-center text-gray-400">
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
            {/* Row 1: Name and Phone */}
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

            {/* Row 2: Email and Tax Number */}
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

            {/* Row 3: Credit Limit (Customers Only) */}
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
                    <div>
                        {/* Spacer to maintain grid layout if needed */}
                    </div>
                </div>
            )}

            {/* Row 4: Address (Full Width) */}
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

            {/* Row 5: Notes (Full Width) */}
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
