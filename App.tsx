
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Globe, Bell, Menu, X } from 'lucide-react';
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
import { ViewState } from './types';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRTL, setIsRTL] = useState(true);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop collapse

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

  return (
    <div className={`flex h-screen w-full font-${isRTL ? 'cairo' : 'sans'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden`}>
      
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed lg:static inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-20
        ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
        transform ${isSidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')} 
        lg:transform-none transition-all duration-300 ease-in-out h-full
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
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {/* User greeting matching screenshot */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">
                {isRTL ? 'مرحباً' : 'Welcome'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* System Title matching screenshot right side */}
             <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {isRTL ? 'نظام المحاسبة' : 'Accounting System'}
            </h1>

             {/* Icons */}
            <button 
              onClick={toggleLang}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600"
            >
              <Globe size={20} />
            </button>

            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-yellow-400"
            >
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-900 p-6">
          <div className="max-w-full mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
