
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Truck,
  LogOut,
  BookOpen,
  Warehouse,
  BarChart3,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  activeView: ViewState;
  onChangeView: (view: ViewState) => void;
  isRTL: boolean;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView, isRTL, isCollapsed = false, toggleCollapse, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: isRTL ? 'لوحة التحكم' : 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: isRTL ? 'العملاء' : 'Customers', icon: Users },
    { id: 'suppliers', label: isRTL ? 'الموردين' : 'Suppliers', icon: Truck },
    { id: 'inventory', label: isRTL ? 'المنتجات' : 'Products', icon: Package },
    { id: 'invoices', label: isRTL ? 'المبيعات' : 'Sales', icon: ShoppingCart }, 
    { id: 'invoices-purchase', label: isRTL ? 'المشتريات' : 'Purchases', icon: ShoppingBag }, // New Icon
    { id: 'accounting', label: isRTL ? 'السندات' : 'Bonds', icon: FileText }, 
    { id: 'expenses', label: isRTL ? 'المخزون' : 'Inventory', icon: Warehouse }, // New Icon
    { id: 'reports', label: isRTL ? 'التقارير' : 'Reports', icon: BarChart3 }, // New Icon
  ];

  // Helper to handle clicks, mapping some visual items to actual views
  const handleItemClick = (id: string) => {
    onChangeView(id as ViewState);
  };

  return (
    <aside className={`h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-20 transition-all duration-300 font-cairo ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Header & Toggle */}
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} border-b border-gray-200 dark:border-gray-700`}>
        
        {/* Left Side (Right in RTL) Group */}
        <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : ''}`}>
             {/* Logo/Title */}
            <div className="flex items-center gap-2 font-bold text-2xl text-gray-800 dark:text-white">
                <span>Milano</span>
            </div>
            
            {/* Mobile Close Button */}
            <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
            >
                <Menu size={24} />
            </button>
        </div>

        {/* Desktop Collapse Button */}
        <button 
            onClick={toggleCollapse}
            className={`p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden lg:block ${isCollapsed ? '' : ''}`}
            title={isRTL ? 'طي القائمة' : 'Toggle Sidebar'}
        >
            {isRTL ? 
                (isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />) : 
                (isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />)
            }
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-2 custom-scrollbar">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                  
                  {!isCollapsed && (
                      <span className="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis animate-fade-in">
                          {item.label}
                      </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                      <div className={`absolute ${isRTL ? 'right-14' : 'left-14'} bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap`}>
                          {item.label}
                      </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Actions */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button className={`w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
          <LogOut size={18} />
          {!isCollapsed && <span>{isRTL ? 'تسجيل خروج' : 'Logout'}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
