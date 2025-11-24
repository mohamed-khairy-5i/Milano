import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Truck,
  LogOut,
  Warehouse,
  BarChart3,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Menu,
  DollarSign,
  Calculator,
  Settings,
  Monitor // Icon for POS
} from 'lucide-react';
import { ViewState } from '../types';
import { useData } from '../DataContext';

interface SidebarProps {
  activeView: ViewState;
  onChangeView: (view: ViewState) => void;
  isRTL: boolean;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  onClose?: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView, isRTL, isCollapsed = false, toggleCollapse, onClose, onLogout }) => {
  const { currentUser, storeName } = useData();
  const permissions = currentUser?.permissions;

  // Helper to check permission
  const can = (perm: keyof typeof permissions) => permissions ? permissions[perm] : false;

  // Base Menu
  const allMenuItems = [
    { id: 'dashboard', label: isRTL ? 'لوحة التحكم' : 'Dashboard', icon: LayoutDashboard, allowed: true }, // Everyone sees dashboard
    
    // POS (First option under Dashboard as requested)
    { id: 'pos', label: isRTL ? 'نقطة بيع (كاشير)' : 'Point of Sale', icon: Monitor, allowed: can('canSell') },

    // Contacts
    { id: 'customers', label: isRTL ? 'العملاء' : 'Customers', icon: Users, allowed: can('canManageContacts') },
    { id: 'suppliers', label: isRTL ? 'الموردين' : 'Suppliers', icon: Truck, allowed: can('canManageContacts') },
    
    // Inventory
    { id: 'inventory', label: isRTL ? 'المنتجات' : 'Products', icon: Package, allowed: can('canManageStock') },
    { id: 'stock', label: isRTL ? 'إدارة المخزون' : 'Stock Mgmt', icon: Warehouse, allowed: can('canManageStock') },
    
    // Sales & Purchases (Now controlled by canManageInvoices)
    { id: 'invoices', label: isRTL ? 'المبيعات' : 'Sales', icon: ShoppingCart, allowed: can('canManageInvoices') }, 
    { id: 'invoices-purchase', label: isRTL ? 'المشتريات' : 'Purchases', icon: ShoppingBag, allowed: can('canManageInvoices') },
    
    // Accounting
    { id: 'accounting', label: isRTL ? 'السندات' : 'Bonds', icon: FileText, allowed: can('canManageAccounting') }, 
    { id: 'expenses', label: isRTL ? 'المصروفات' : 'Expenses', icon: DollarSign, allowed: can('canManageAccounting') },
    { id: 'accounts', label: isRTL ? 'إدارة الحسابات' : 'Accounts', icon: Calculator, allowed: can('canManageAccounting') },
    
    // Reports
    { id: 'reports', label: isRTL ? 'التقارير' : 'Reports', icon: BarChart3, allowed: can('canViewReports') },
    
    // Settings
    { id: 'settings', label: isRTL ? 'الإعدادات' : 'Settings', icon: Settings, allowed: can('canManageSettings') },
  ];

  const menuItems = allMenuItems.filter(item => item.allowed);

  const handleItemClick = (id: string) => {
    onChangeView(id as ViewState);
  };

  return (
    <aside className={`h-full flex flex-col z-20 transition-all duration-300 font-cairo ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Header & Toggle */}
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} border-b border-gray-200 dark:border-gray-700 shrink-0`}>
        
        {/* Left Side Group */}
        <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : ''}`}>
             {/* Logo - Removed as requested, only text remains */}
            <div className="flex items-center gap-2 font-bold text-xl text-gray-800 dark:text-white">
                <span>{storeName}</span>
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

      {/* User Info Compact */}
      {!isCollapsed && currentUser && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500">{isRTL ? 'المستخدم الحالي' : 'Current User'}</div>
            <div className="font-bold text-sm truncate">{currentUser.name}</div>
            <div className="text-xs text-primary truncate">{currentUser.role === 'admin' ? (isRTL ? 'مدير' : 'Admin') : (isRTL ? 'موظف' : 'Employee')}</div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-gray-900 text-white shadow-md dark:bg-primary' 
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
                      <div className={`absolute ${isRTL ? 'right-16' : 'left-16'} bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg`}>
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>{isRTL ? 'تسجيل خروج' : 'Logout'}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;