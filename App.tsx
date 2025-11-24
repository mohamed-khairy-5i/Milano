import React, { useState, useEffect } from 'react';
import { Sun, Moon, Globe, Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Contacts from './components/Contacts';
import Invoices from './components/Invoices';
import Expenses from './components/Expenses';
import Stock from './components/Stock';
import Bonds from './components/Bonds';
import Reports from './components/Reports';
import Accounts from './components/Accounts';
import Settings from './components/Settings';
import Login from './Login';
import { ViewState } from './types';
import { useData, Currency } from './DataContext';

const App: React.FC = () => {
  const { currency, setCurrency, currentUser, logoutUser } = useData();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRTL, setIsRTL] = useState(true);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize theme and direction
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = isRTL ? 'ar' : 'en';
  }, [isRTL]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleLang = () => setIsRTL(!isRTL);

  // Render content based on view and permissions
  const renderContent = () => {
    // Security Check: If user tries to access a view they don't have permission for
    const p = currentUser?.permissions;
    if (!p) return <Dashboard isRTL={isRTL} />; // Fallback

    switch (activeView) {
      case 'dashboard':
        return <Dashboard isRTL={isRTL} />;
      case 'pos':
        return p.canSell ? <POS isRTL={isRTL} /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      case 'inventory':
        return p.canManageStock ? <Inventory isRTL={isRTL} /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      case 'invoices':
        return p.canManageInvoices ? <Invoices isRTL={isRTL} type="sale" /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      case 'invoices-purchase':
        return p.canManageInvoices ? <Invoices isRTL={isRTL} type="purchase" /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      case 'customers':
        return p.canManageContacts ? <Contacts isRTL={isRTL} type="customer" /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      case 'suppliers':
        return p.canManageContacts ? <Contacts isRTL={isRTL} type="supplier" /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      case 'expenses':
        return p.canManageAccounting ? <Expenses isRTL={isRTL} /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      case 'stock':
        return p.canManageStock ? <Stock isRTL={isRTL} /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      case 'accounting':
         return p.canManageAccounting ? <Bonds isRTL={isRTL} /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      case 'accounts':
         return p.canManageAccounting ? <Accounts isRTL={isRTL} /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      case 'reports':
         return p.canViewReports ? <Reports isRTL={isRTL} /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      case 'settings':
        return p.canManageSettings ? <Settings isRTL={isRTL} /> : <div className="p-10 text-center text-red-500">Access Denied</div>;
      default:
        return <Dashboard isRTL={isRTL} />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={() => {}} isRTL={isRTL} />;
  }

  return (
    <div className={`flex h-screen w-full font-${isRTL ? 'cairo' : 'sans'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden`}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed lg:static inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-30
        ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
        transform ${isSidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')} 
        lg:transform-none transition-all duration-300 ease-in-out h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
      `}>
         <Sidebar 
            activeView={activeView} 
            onChangeView={(view) => { setActiveView(view); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} 
            isRTL={isRTL}
            isCollapsed={isSidebarCollapsed}
            toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={logoutUser}
         />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative transition-all duration-300">
        
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-10 shrink-0">
          
          <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="hidden md:flex items-center gap-2">
                <img src="https://www.dropbox.com/scl/fi/d5o0abej6u2h2ljsjvhfv/IMG-20251125-WA0002.jpg?rlkey=l82w3l7ax2atf5il7gf7oarp3&st=xg0zjv1m&raw=1" alt="Logo" className="w-8 h-8 object-contain" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase">
                    {isRTL ? 'ميلانو' : 'MILANO'}
                </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
             {/* Currency Selector */}
             <select 
               value={currency}
               onChange={(e) => setCurrency(e.target.value as Currency)}
               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none cursor-pointer"
             >
               <option value="YER">{isRTL ? 'ريال يمني' : 'YER'}</option>
               <option value="SAR">{isRTL ? 'ريال سعودي' : 'SAR'}</option>
               <option value="USD">{isRTL ? 'دولار أمريكي' : 'USD'}</option>
               <option value="AED">{isRTL ? 'درهم إماراتي' : 'AED'}</option>
             </select>

             {/* Icons */}
            <button 
              onClick={toggleLang}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
              title={isRTL ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe size={20} />
            </button>

            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-yellow-400"
            >
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button 
              onClick={logoutUser}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
            >
              {isRTL ? 'خروج' : 'Logout'}
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
          <div className="max-w-full mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;