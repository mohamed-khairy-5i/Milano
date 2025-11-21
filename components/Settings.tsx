
import React, { useState } from 'react';
import { Save, Globe, Database, User, Shield, Building, Check, RefreshCw } from 'lucide-react';
import { useData } from '../DataContext';

interface SettingsProps {
  isRTL: boolean;
}

const Settings: React.FC<SettingsProps> = ({ isRTL }) => {
  const { currency, setCurrency, resetData } = useData();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: isRTL ? 'عام' : 'General', icon: Building },
    { id: 'users', label: isRTL ? 'المستخدمين' : 'Users', icon: User },
    { id: 'currencies', label: isRTL ? 'العملات' : 'Currencies', icon: Globe },
    { id: 'backup', label: isRTL ? 'النسخ الاحتياطي' : 'Backup', icon: Database },
    { id: 'permissions', label: isRTL ? 'الصلاحيات' : 'Permissions', icon: Shield },
  ];

  const handleLoadDemoData = () => {
      if (confirm(isRTL ? 'سيتم استبدال البيانات الحالية ببيانات تجريبية واقعية. هل أنت متأكد؟' : 'This will replace current data with realistic demo data. Are you sure?')) {
          resetData();
          alert(isRTL ? 'تم تحميل البيانات بنجاح!' : 'Demo data loaded successfully!');
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
                        <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" defaultValue="Milano Store" />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            {isRTL ? 'العنوان' : 'Address'}
                        </label>
                        <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" defaultValue="Main Street, City Center" />
                    </div>
                     <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                        </label>
                        <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" defaultValue="+967 777 000 000" />
                    </div>
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
                    <div 
                         onClick={() => setCurrency('YER')}
                         className={`p-4 border rounded-lg cursor-pointer transition-all flex justify-between items-center ${currency === 'YER' ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">YER</div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{isRTL ? 'ريال يمني' : 'Yemeni Rial'}</p>
                                <p className="text-sm text-gray-500">YER</p>
                            </div>
                        </div>
                        {currency === 'YER' && <Check size={20} className="text-primary" />}
                    </div>

                    <div 
                         onClick={() => setCurrency('SAR')}
                         className={`p-4 border rounded-lg cursor-pointer transition-all flex justify-between items-center ${currency === 'SAR' ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">SAR</div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{isRTL ? 'ريال سعودي' : 'Saudi Riyal'}</p>
                                <p className="text-sm text-gray-500">SAR</p>
                            </div>
                        </div>
                        {currency === 'SAR' && <Check size={20} className="text-primary" />}
                    </div>

                    <div 
                         onClick={() => setCurrency('USD')}
                         className={`p-4 border rounded-lg cursor-pointer transition-all flex justify-between items-center ${currency === 'USD' ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">USD</div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{isRTL ? 'دولار أمريكي' : 'US Dollar'}</p>
                                <p className="text-sm text-gray-500">USD</p>
                            </div>
                        </div>
                        {currency === 'USD' && <Check size={20} className="text-primary" />}
                    </div>
                </div>
            </div>
        )}

        {/* Backup Settings */}
        {activeTab === 'backup' && (
             <div className="space-y-6 max-w-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                    {isRTL ? 'النسخ الاحتياطي والاستعادة' : 'Backup & Restore'}
                </h3>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg text-purple-600 dark:text-purple-300">
                            <RefreshCw size={24} />
                        </div>
                        <div>
                             <h4 className="font-semibold text-gray-900 dark:text-white">{isRTL ? 'تحميل بيانات تجريبية' : 'Load Demo Data'}</h4>
                             <p className="text-sm text-gray-500">{isRTL ? 'استبدال البيانات الحالية ببيانات واقعية للتجربة' : 'Replace current data with realistic demo data'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLoadDemoData}
                        className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-bold"
                    >
                        {isRTL ? 'تحميل البيانات الآن' : 'Load Data Now'}
                    </button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-semibold text-primary mb-2">{isRTL ? 'إنشاء نسخة احتياطية' : 'Create Backup'}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {isRTL ? 'قم بتحميل نسخة كاملة من قاعدة البيانات لحفظها محلياً.' : 'Download a full copy of your database to save locally.'}
                    </p>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        {isRTL ? 'تحميل النسخة' : 'Download Backup'}
                    </button>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{isRTL ? 'استعادة نسخة' : 'Restore Backup'}</h4>
                     <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" type="file" />
                </div>
            </div>
        )}

        {/* Placeholder for others */}
        {['users', 'permissions'].includes(activeTab) && (
            <div className="flex items-center justify-center h-64 text-gray-400 animate-fade-in">
                <p>{isRTL ? 'هذا القسم قيد التطوير...' : 'This section is under development...'}</p>
            </div>
        )}

        {/* Save Button */}
        {activeTab === 'general' && (
            <div className="mt-8 pt-4 border-t dark:border-gray-700">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                    <Save size={18} />
                    <span>{isRTL ? 'حفظ التغييرات' : 'Save Changes'}</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
