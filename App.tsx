
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
import Settings from './components/Settings';
import Login from './Login';
import { ViewState } from './types';
import { useData, Currency } from './DataContext';

const App: React.FC = () => {
  const { currency, setCurrency } = useData();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRTL, setIsRTL] = useState(true);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop collapse
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('milano_auth') === 'true';
  });

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

  const handleLogin = () => {
    localStorage.setItem('milano_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.setItem('milano_auth', 'false');
    setIsAuthenticated(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard isRTL={isRTL} />;
      case 'pos':
        return <POS isRTL={isRTL} />;
      case 'inventory':
        return <Inventory isRTL={isRTL} />;
      case 'invoices':
        return <Invoices isRTL={isRTL} type="sale" />;
      case 'invoices-purchase':
        return <Invoices isRTL={isRTL} type="purchase" />;
      case 'customers':
        return <Contacts isRTL={isRTL} type="customer" />;
      case 'suppliers':
        return <Contacts isRTL={isRTL} type="supplier" />;
      case 'expenses':
        return <Expenses isRTL={isRTL} />;
      case 'stock':
        return <Stock isRTL={isRTL} />;
      case 'accounting':
         return <Bonds isRTL={isRTL} />;
      case 'reports':
         return <Reports isRTL={isRTL} />;
      case 'settings':
        return <Settings isRTL={isRTL} />;
      default:
        return <Dashboard isRTL={isRTL} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} isRTL={isRTL} />;
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
            <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">
                {isRTL ? 'مرحباً بك' : 'Welcome'}
            </h2>
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
              onClick={handleLogout}
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
