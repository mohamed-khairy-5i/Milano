
import React, { useState } from 'react';
import { DollarSign, Plus, Calendar, Trash2, Edit, PieChart, Save } from 'lucide-react';
import { useData } from '../DataContext';
import { Expense } from '../types';
import Modal from './Modal';

interface ExpensesProps {
  isRTL: boolean;
}

const Expenses: React.FC<ExpensesProps> = ({ isRTL }) => {
  const { expenses, addExpense, updateExpense, deleteExpense, currency } = useData();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Partial<Expense>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Currency Label
  const currencyLabels: Record<string, string> = {
      'YER': isRTL ? 'ريال يمني' : 'YER',
      'SAR': isRTL ? 'ريال سعودي' : 'SAR',
      'USD': isRTL ? 'دولار' : 'USD',
  };
  const currencyLabel = currencyLabels[currency];

  // Calculations
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // This Month Expenses
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((acc, curr) => acc + curr.amount, 0);

  // Top Category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  
  let topCategory = '-';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amount]) => {
      if (amount > topCategoryAmount) {
          topCategoryAmount = amount;
          topCategory = cat;
      }
  });

  const handleOpenAdd = () => {
    setCurrentExpense({
      title: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setCurrentExpense({ ...expense });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentExpense.title || !currentExpense.amount) return;

    if (isEditing && currentExpense.id) {
      updateExpense(currentExpense as Expense);
    } else {
      addExpense(currentExpense as Omit<Expense, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-red-500">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{isRTL ? 'إجمالي المصروفات' : 'Total Expenses'}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 flex items-baseline gap-1">
                        {totalExpenses.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500">{currencyLabel}</span>
                    </h3>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-500">
                    <DollarSign size={24} />
                </div>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
             <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{isRTL ? 'مصروفات هذا الشهر' : 'This Month'}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 flex items-baseline gap-1">
                        {thisMonthExpenses.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500">{currencyLabel}</span>
                    </h3>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                    <Calendar size={24} />
                </div>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
             <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{isRTL ? 'أعلى تصنيف' : 'Top Category'}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{topCategory}</h3>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                    <PieChart size={24} />
                </div>
            </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
         <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
               {isRTL ? 'سجل المصروفات' : 'Expense Log'}
            </h2>
            <button 
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
                <Plus size={18} />
                <span>{isRTL ? 'مصروف جديد' : 'Add Expense'}</span>
            </button>
         </div>
         
         <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-3">{isRTL ? 'البند' : 'Title'}</th>
                        <th scope="col" className="px-6 py-3">{isRTL ? 'التصنيف' : 'Category'}</th>
                        <th scope="col" className="px-6 py-3">{isRTL ? 'التاريخ' : 'Date'}</th>
                        <th scope="col" className="px-6 py-3">{isRTL ? 'المبلغ' : 'Amount'}</th>
                        <th scope="col" className="px-6 py-3 text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {expenses.map((expense) => (
                        <tr key={expense.id} className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{expense.title}</td>
                            <td className="px-6 py-4">{expense.category}</td>
                            <td className="px-6 py-4">{expense.date}</td>
                            <td className="px-6 py-4 font-bold">{expense.amount.toLocaleString()} {currencyLabel}</td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => handleOpenEdit(expense)}
                                        className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(expense.id)}
                                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {expenses.length === 0 && (
                         <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                {isRTL ? 'لا توجد مصروفات' : 'No expenses found'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
         </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? (isRTL ? 'تعديل مصروف' : 'Edit Expense') : (isRTL ? 'إضافة مصروف جديد' : 'Add New Expense')}
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
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'عنوان المصروف' : 'Expense Title'}</label>
                <input 
                    type="text" 
                    value={currentExpense.title || ''}
                    onChange={e => setCurrentExpense({ ...currentExpense, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'المبلغ' : 'Amount'}</label>
                    <input 
                        type="number" 
                        value={currentExpense.amount || ''}
                        onChange={e => setCurrentExpense({ ...currentExpense, amount: Number(e.target.value) })}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'التاريخ' : 'Date'}</label>
                    <input 
                        type="date" 
                        value={currentExpense.date || ''}
                        onChange={e => setCurrentExpense({ ...currentExpense, date: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'التصنيف' : 'Category'}</label>
                 <select 
                    value={currentExpense.category || ''}
                    onChange={e => setCurrentExpense({ ...currentExpense, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                >
                    <option value="">{isRTL ? 'اختر تصنيف' : 'Select Category'}</option>
                    <option value="Utilities">{isRTL ? 'فواتير' : 'Utilities'}</option>
                    <option value="Rent">{isRTL ? 'إيجار' : 'Rent'}</option>
                    <option value="Salaries">{isRTL ? 'رواتب' : 'Salaries'}</option>
                    <option value="Maintenance">{isRTL ? 'صيانة' : 'Maintenance'}</option>
                    <option value="Other">{isRTL ? 'أخرى' : 'Other'}</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الوصف' : 'Description'}</label>
                <textarea 
                    rows={3}
                    value={currentExpense.description || ''}
                    onChange={e => setCurrentExpense({ ...currentExpense, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;
