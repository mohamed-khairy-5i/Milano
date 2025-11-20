
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

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const currencyLabels: Record<string, string> = {
      'YER': isRTL ? 'ريال يمني' : 'YER',
      'SAR': isRTL ? 'ريال سعودي' : 'SAR',
      'USD': isRTL ? 'دولار' : 'USD',
  };
  const currencyLabel = currencyLabels[currency];

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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-expense">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{isRTL ? 'إجمالي المصروفات' : 'Total Expenses'}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 flex items-baseline gap-1">
                        {totalExpenses.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500">{currencyLabel}</span>
                    </h3>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-expense">
                    <DollarSign size={24} />
                </div>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
             <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{isRTL ? 'مصروفات هذا الشهر' : 'This Month'}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 flex items-baseline gap-1">
                        450
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
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Rent</h3>
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
                className="flex items-center gap-2 px-4 py-2 bg-expense text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
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
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {expense.title}
                            </td>
                            <td className="px-6 py-4">
                                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                                    {expense.category}
                                </span>
                            </td>
                            <td className="px-6 py-4">{expense.date}</td>
                            <td className="px-6 py-4 font-bold text-expense">
                                {expense.amount.toLocaleString()} {currencyLabel}
                            </td>
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
                </tbody>
            </table>
         </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? (isRTL ? 'تعديل مصروف' : 'Edit Expense') : (isRTL ? 'إضافة مصروف' : 'Add Expense')}
        isRTL={isRTL}
        footer={
            <>
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Save size={16} />
                    {isRTL ? 'حفظ' : 'Save'}
                </button>
            </>
        }
      >
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'اسم البند' : 'Title'}</label>
                <input 
                    type="text" 
                    value={currentExpense.title || ''}
                    onChange={e => setCurrentExpense({...currentExpense, title: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'التصنيف' : 'Category'}</label>
                <select
                    value={currentExpense.category || ''}
                    onChange={e => setCurrentExpense({...currentExpense, category: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="">{isRTL ? 'اختر تصنيف' : 'Select Category'}</option>
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Food">Food</option>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'المبلغ' : 'Amount'}</label>
                <input 
                    type="number" 
                    value={currentExpense.amount || 0}
                    onChange={e => setCurrentExpense({...currentExpense, amount: Number(e.target.value)})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'التاريخ' : 'Date'}</label>
                <input 
                    type="date" 
                    value={currentExpense.date || ''}
                    onChange={e => setCurrentExpense({...currentExpense, date: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;
