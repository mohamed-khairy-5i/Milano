
import React, { useState, useEffect } from 'react';
import { Save, Globe, Database, User, Shield, Building, Check, Trash2, RefreshCw, Plus, Lock, UserX, Edit, UserPlus, Server } from 'lucide-react';
import { useData } from '../DataContext';
import { User as UserType, UserPermissions } from '../types';
import Modal from './Modal';

interface SettingsProps {
  isRTL: boolean;
}

const Settings: React.FC<SettingsProps> = ({ isRTL }) => {
  const { currency, setCurrency, resetData, users, currentUser, addEmployee, updateUser, deleteUser, storeName, updateStoreSettings, registerStore } = useData();
  const [activeTab, setActiveTab] = useState('general');
  const [isResetting, setIsResetting] = useState(false);

  // General Settings State
  const [localStoreName, setLocalStoreName] = useState(storeName);

  useEffect(() => {
      setLocalStoreName(storeName);
  }, [storeName]);

  // User Management State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [newUser, setNewUser] = useState<{
    name: string;
    username: string;
    password: string;
    permissions: UserPermissions;
  }>({
    name: '',
    username: '',
    password: '',
    permissions: {
      canSell: true,
      canManageInvoices: false,
      canManageStock: false,
      canManageContacts: false,
      canManageAccounting: false,
      canViewReports: false,
      canManageSettings: false
    }
  });

  // New Store Registration State
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [newStoreData, setNewStoreData] = useState({
      name: '',
      adminName: '',
      username: '',
      password: '',
      confirmPassword: ''
  });

  const tabs = [
    { id: 'general', label: isRTL ? 'عام' : 'General', icon: Building },
    { id: 'users', label: isRTL ? 'المستخدمين والصلاحيات' : 'Users & Permissions', icon: User },
    { id: 'currencies', label: isRTL ? 'العملات' : 'Currencies', icon: Globe },
    { id: 'backup', label: isRTL ? 'النسخ الاحتياطي' : 'Backup', icon: Database },
    { id: 'system', label: isRTL ? 'إدارة النظام' : 'System Admin', icon: Server },
  ];

  const handleSaveGeneral = async () => {
      if (localStoreName.trim()) {
          await updateStoreSettings({ name: localStoreName });
          alert(isRTL ? 'تم حفظ التغييرات بنجاح' : 'Settings saved successfully');
      }
  };

  const handleClearData = async () => {
      if (confirm(isRTL ? 'تحذير: سيتم حذف جميع البيانات (المنتجات، العملاء، الفواتير) والعودة لحالة المصنع. هل أنت متأكد؟' : 'WARNING: This will delete ALL data (Products, Clients, Invoices) and reset to factory settings. Are you sure?')) {
          try {
              setIsResetting(true);
              await resetData();
              alert(isRTL ? 'تم حذف البيانات بنجاح.' : 'Data cleared successfully.');
          } catch (error) {
              alert(isRTL ? 'حدث خطأ أثناء الحذف.' : 'Error clearing data.');
              console.error(error);
          } finally {
              setIsResetting(false);
          }
      }
  };

  const handleOpenAddUser = () => {
      setEditingUserId(null);
      setNewUser({
        name: '',
        username: '',
        password: '',
        permissions: {
          canSell: true,
          canManageInvoices: false,
          canManageStock: false,
          canManageContacts: false,
          canManageAccounting: false,
          canViewReports: false,
          canManageSettings: false
        }
      });
      setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserType) => {
      setEditingUserId(user.id);
      setNewUser({
          name: user.name,
          username: user.username,
          password: user.password,
          permissions: { ...user.permissions }
      });
      setIsUserModalOpen(true);
  };

  const handleSaveUser = async () => {
      if (!newUser.name || !newUser.username || !newUser.password) {
          alert(isRTL ? 'جميع الحقول مطلوبة' : 'All fields are required');
          return;
      }

      if (editingUserId) {
          // Update existing user
          const result = await updateUser({
              id: editingUserId,
              name: newUser.name,
              username: newUser.username,
              password: newUser.password,
              permissions: newUser.permissions
          });

          if (result.success) {
              setIsUserModalOpen(false);
              setNewUser({
                name: '',
                username: '',
                password: '',
                permissions: {
                  canSell: true,
                  canManageInvoices: false,
                  canManageStock: false,
                  canManageContacts: false,
                  canManageAccounting: false,
                  canViewReports: false,
                  canManageSettings: false
                }
              });
              setEditingUserId(null);
              alert(isRTL ? 'تم تحديث البيانات بنجاح' : 'User updated successfully');
          } else {
              alert(result.message);
          }
      } else {
          // Add new user
          const result = await addEmployee({
              name: newUser.name,
              username: newUser.username,
              password: newUser.password,
              role: 'user',
              permissions: newUser.permissions
          });

          if (result.success) {
              setIsUserModalOpen(false);
              setNewUser({
                name: '',
                username: '',
                password: '',
                permissions: {
                  canSell: true,
                  canManageInvoices: false,
                  canManageStock: false,
                  canManageContacts: false,
                  canManageAccounting: false,
                  canViewReports: false,
                  canManageSettings: false
                }
              });
              alert(isRTL ? 'تم إضافة المستخدم بنجاح' : 'User added successfully');
          } else {
              alert(result.message);
          }
      }
  };

  const handleDeleteUser = async (id: string) => {
      if (id === currentUser?.id) {
          alert(isRTL ? 'لا يمكنك حذف حسابك الحالي' : 'You cannot delete your own account');
          return;
      }
      if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا المستخدم؟ لن يتمكن من الدخول مرة أخرى.' : 'Are you sure? This user will not be able to login again.')) {
          await deleteUser(id);
      }
  };

  // Handle creating a completely new store
  const handleCreateStore = async () => {
      if (!newStoreData.name || !newStoreData.adminName || !newStoreData.username || !newStoreData.password) {
          alert(isRTL ? 'جميع الحقول مطلوبة' : 'All fields are required');
          return;
      }
      if (newStoreData.password !== newStoreData.confirmPassword) {
          alert(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
          return;
      }

      const result = await registerStore({
          name: newStoreData.adminName,
          username: newStoreData.username,
          password: newStoreData.password,
          role: 'admin'
      });

      if (result.success) {
          alert(isRTL ? 'تم إنشاء المتجر الجديد بنجاح! يرجى تسجيل الخروج والدخول بالحساب الجديد.' : 'New store created successfully! Please logout and login with the new account.');
          setIsStoreModalOpen(false);
          setNewStoreData({ name: '', adminName: '', username: '', password: '', confirmPassword: '' });
      } else {
          alert(result.message);
      }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 h-fit">
        <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap
                            ${activeTab === tab.id 
                            ? 'bg-primary text-white shadow-md' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Icon size={18} />
                        <span className="font-medium">{tab.label}</span>
                    </button>
                )
            })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
        
        {/* General Settings */}
        {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                    {isRTL ? 'معلومات المتجر' : 'Store Information'}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            {isRTL ? 'اسم المتجر' : 'Store Name'}
                        </label>
                        <input 
                            type="text" 
                            value={localStoreName}
                            onChange={(e) => setLocalStoreName(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        />
                    </div>
                </div>
                <div className="mt-8 pt-4 border-t dark:border-gray-700">
                    <button 
                        onClick={handleSaveGeneral}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Save size={18} />
                        <span>{isRTL ? 'حفظ التغييرات' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>
        )}

        {/* User Management Settings */}
        {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isRTL ? 'إدارة المستخدمين والموظفين' : 'User & Employee Management'}
                    </h3>
                    <button 
                        onClick={handleOpenAddUser}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold"
                    >
                        <Plus size={18} />
                        <span>{isRTL ? 'إضافة موظف' : 'Add Employee'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Current User Card */}
                    <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-xl relative">
                         <div className="absolute top-4 end-4 flex items-center gap-2">
                            {/* Edit Current User */}
                            <button 
                                onClick={() => currentUser && handleOpenEditUser(currentUser)}
                                className="p-1.5 bg-white/80 hover:bg-white text-gray-600 rounded-lg transition-colors border border-green-100 shadow-sm"
                                title={isRTL ? 'تعديل بياناتي' : 'Edit My Info'}
                            >
                                <Edit size={14} />
                            </button>
                            <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-bold">
                                {isRTL ? 'أنت (المدير)' : 'You (Admin)'}
                            </span>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">
                                {currentUser?.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{currentUser?.name}</h4>
                                <p className="text-sm text-gray-500">@{currentUser?.username}</p>
                            </div>
                         </div>
                    </div>

                    {/* Other Users List */}
                    {users.filter(u => u.id !== currentUser?.id).map(user => (
                        <div key={user.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold text-xl">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{user.name}</h4>
                                    <p className="text-sm text-gray-500">@{user.username}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {/* Badges for permissions */}
                                        {user.permissions.canSell && <span className="text-[10px] px-1.5 bg-blue-100 text-blue-800 rounded">POS</span>}
                                        {user.permissions.canManageInvoices && <span className="text-[10px] px-1.5 bg-indigo-100 text-indigo-800 rounded">Sales/Purch</span>}
                                        {user.permissions.canManageStock && <span className="text-[10px] px-1.5 bg-purple-100 text-purple-800 rounded">Stock</span>}
                                        {user.permissions.canViewReports && <span className="text-[10px] px-1.5 bg-orange-100 text-orange-800 rounded">Reports</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleOpenEditUser(user)}
                                    className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title={isRTL ? 'تعديل البيانات' : 'Edit Info'}
                                >
                                    <Edit size={20} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title={isRTL ? 'حذف المستخدم' : 'Remove User'}
                                >
                                    <UserX size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Currency Settings */}
        {activeTab === 'currencies' && (
             <div className="space-y-6 max-w-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                    {isRTL ? 'إعدادات العملة' : 'Currency Settings'}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {['YER', 'SAR', 'USD', 'AED'].map(curr => (
                         <div 
                            key={curr}
                            onClick={() => setCurrency(curr as any)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all flex justify-between items-center ${currency === curr ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">{curr}</div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{curr}</p>
                                </div>
                            </div>
                            {currency === curr && <Check size={20} className="text-primary" />}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Backup Settings */}
        {activeTab === 'backup' && (
             <div className="space-y-6 max-w-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                    {isRTL ? 'النسخ الاحتياطي والاستعادة' : 'Backup & Restore'}
                </h3>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg text-red-600 dark:text-red-300">
                            <Trash2 size={24} />
                        </div>
                        <div>
                             <h4 className="font-semibold text-gray-900 dark:text-white">{isRTL ? 'حذف جميع البيانات' : 'Clear All Data'}</h4>
                             <p className="text-sm text-gray-500">{isRTL ? 'إعادة ضبط المصنع وحذف جميع البيانات المدخلة.' : 'Factory reset: Delete all entered data.'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleClearData}
                        disabled={isResetting}
                        className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-bold flex justify-center items-center gap-2"
                    >
                        {isResetting && <RefreshCw size={16} className="animate-spin" />}
                        {isRTL ? 'حذف البيانات (ضبط المصنع)' : 'Factory Reset'}
                    </button>
                </div>
            </div>
        )}

        {/* System Admin Settings (New Store) */}
        {activeTab === 'system' && (
             <div className="space-y-6 max-w-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                    {isRTL ? 'إدارة النظام' : 'System Management'}
                </h3>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                            <UserPlus size={24} />
                        </div>
                        <div>
                             <h4 className="font-semibold text-gray-900 dark:text-white">{isRTL ? 'إنشاء متجر جديد' : 'Create New Store'}</h4>
                             <p className="text-sm text-gray-500">{isRTL ? 'إنشاء قاعدة بيانات جديدة وحساب مدير مستقل (منفصل تماماً عن هذا المتجر).' : 'Create a completely new store database and admin account.'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsStoreModalOpen(true)}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold flex justify-center items-center gap-2"
                    >
                        <Plus size={16} />
                        {isRTL ? 'إنشاء متجر جديد' : 'Create New Store'}
                    </button>
                </div>
            </div>
        )}

      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUserId ? (isRTL ? 'تعديل بيانات المستخدم' : 'Edit User Info') : (isRTL ? 'إضافة موظف جديد' : 'Add New Employee')}
        isRTL={isRTL}
        footer={
            <>
                <button onClick={() => setIsUserModalOpen(false)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleSaveUser} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold">
                    {isRTL ? (editingUserId ? 'تحديث' : 'إضافة') : (editingUserId ? 'Update' : 'Add')}
                </button>
            </>
        }
      >
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-1">{isRTL ? 'الاسم' : 'Name'}</label>
                  <input 
                    type="text" 
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium mb-1">{isRTL ? 'اسم الدخول' : 'Username'}</label>
                      <input 
                        type="text" 
                        value={newUser.username} 
                        onChange={e => setNewUser({...newUser, username: e.target.value})}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                      <input 
                        type="text" 
                        value={newUser.password} 
                        onChange={e => setNewUser({...newUser, password: e.target.value})}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                  </div>
              </div>

              <div className="border-t pt-4 mt-4 dark:border-gray-700">
                  <h4 className="font-bold mb-3">{isRTL ? 'الصلاحيات' : 'Permissions'}</h4>
                  <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newUser.permissions.canSell} 
                            onChange={e => setNewUser({...newUser, permissions: {...newUser.permissions, canSell: e.target.checked}})}
                            className="w-4 h-4"
                          />
                          <span>{isRTL ? 'نقطة البيع (الكاشير فقط)' : 'POS (Cashier Only)'}</span>
                      </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newUser.permissions.canManageInvoices} 
                            onChange={e => setNewUser({...newUser, permissions: {...newUser.permissions, canManageInvoices: e.target.checked}})}
                            className="w-4 h-4"
                          />
                          <span>{isRTL ? 'إدارة المبيعات والمشتريات' : 'Sales & Purchases Management'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newUser.permissions.canManageStock} 
                            onChange={e => setNewUser({...newUser, permissions: {...newUser.permissions, canManageStock: e.target.checked}})}
                            className="w-4 h-4"
                          />
                          <span>{isRTL ? 'إدارة المخزون والمنتجات' : 'Manage Inventory'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newUser.permissions.canManageContacts} 
                            onChange={e => setNewUser({...newUser, permissions: {...newUser.permissions, canManageContacts: e.target.checked}})}
                            className="w-4 h-4"
                          />
                          <span>{isRTL ? 'إدارة العملاء والموردين' : 'Manage Contacts'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newUser.permissions.canManageAccounting} 
                            onChange={e => setNewUser({...newUser, permissions: {...newUser.permissions, canManageAccounting: e.target.checked}})}
                            className="w-4 h-4"
                          />
                          <span>{isRTL ? 'الحسابات والسندات والمصاريف' : 'Accounting & Bonds'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newUser.permissions.canViewReports} 
                            onChange={e => setNewUser({...newUser, permissions: {...newUser.permissions, canViewReports: e.target.checked}})}
                            className="w-4 h-4"
                          />
                          <span>{isRTL ? 'عرض التقارير' : 'View Reports'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-red-600">
                          <input 
                            type="checkbox" 
                            checked={newUser.permissions.canManageSettings} 
                            onChange={e => setNewUser({...newUser, permissions: {...newUser.permissions, canManageSettings: e.target.checked}})}
                            className="w-4 h-4"
                          />
                          <span>{isRTL ? 'الإعدادات وإدارة الموظفين (Admin)' : 'Settings & User Management'}</span>
                      </label>
                  </div>
              </div>
          </div>
      </Modal>

      {/* Create New Store Modal */}
      <Modal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        title={isRTL ? 'إنشاء متجر جديد (حساب مستقل)' : 'Create New Store (Fresh Account)'}
        isRTL={isRTL}
        footer={
            <>
                <button onClick={() => setIsStoreModalOpen(false)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleCreateStore} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold">
                    {isRTL ? 'إنشاء المتجر' : 'Create Store'}
                </button>
            </>
        }
      >
          <div className="space-y-4">
              <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                  {isRTL 
                    ? 'تنبيه: سيقوم هذا بإنشاء متجر جديد تماماً بقاعدة بيانات منفصلة. يمكنك استخدام بيانات الدخول الجديدة لتسجيل الدخول.'
                    : 'Note: This will create a completely fresh store with a separate database. You can use the new credentials to login.'
                  }
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">{isRTL ? 'اسم المتجر الجديد' : 'New Store Name'}</label>
                  <input 
                    type="text" 
                    value={newStoreData.name} 
                    onChange={e => setNewStoreData({...newStoreData, name: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder={isRTL ? 'مثال: متجر ميلانو 2' : 'e.g. Milano Branch 2'}
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">{isRTL ? 'اسم المدير الكامل' : 'Admin Full Name'}</label>
                  <input 
                    type="text" 
                    value={newStoreData.adminName} 
                    onChange={e => setNewStoreData({...newStoreData, adminName: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium mb-1">{isRTL ? 'اسم المستخدم (للدخول)' : 'Username'}</label>
                      <input 
                        type="text" 
                        value={newStoreData.username} 
                        onChange={e => setNewStoreData({...newStoreData, username: e.target.value})}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                      <input 
                        type="password" 
                        value={newStoreData.password} 
                        onChange={e => setNewStoreData({...newStoreData, password: e.target.value})}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                  <input 
                    type="password" 
                    value={newStoreData.confirmPassword} 
                    onChange={e => setNewStoreData({...newStoreData, confirmPassword: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default Settings;
