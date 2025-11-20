
import React from 'react';
import { 
  DollarSign, 
  Package, 
  AlertTriangle 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useData } from '../DataContext';

interface DashboardProps {
  isRTL: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isRTL }) => {
  const { products, invoices } = useData();

  // Calculations
  const totalSales = invoices
    .filter(i => i.type === 'sale' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.total, 0);
  
  const salesCount = invoices.filter(i => i.type === 'sale').length;

  const inventoryValue = products.reduce((sum, p) => sum + (p.priceBuy * p.stock), 0);
  const productCount = products.length;

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-YE' : 'en-US', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Generate Chart Data (Last 7 days)
  const generateChartData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        // Sum sales for this day
        const sales = invoices
            .filter(inv => inv.date === dateStr && inv.type === 'sale')
            .reduce((acc, inv) => acc + inv.total, 0);

        // Sum purchases for this day
        const purchases = invoices
            .filter(inv => inv.date === dateStr && inv.type === 'purchase')
            .reduce((acc, inv) => acc + inv.total, 0);

        days.push({
            name: dateStr.substring(5), // MM-DD
            fullDate: dateStr,
            sales,
            purchases
        });
    }
    return days;
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRTL ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-40">
             <div className="flex justify-between items-start">
                 <span className="text-gray-600 dark:text-gray-300 font-medium">
                     {isRTL ? 'إجمالي المبيعات' : 'Total Sales'}
                 </span>
                 <div className="text-gray-400">
                     <DollarSign size={22} />
                 </div>
             </div>
             <div className="mt-auto">
                 <div className="text-3xl font-bold text-gray-900 dark:text-white flex items-baseline gap-2">
                     {formatCurrency(totalSales)} 
                     <span className="text-lg font-normal text-gray-500">{isRTL ? 'ريال يمني' : 'YER'}</span>
                 </div>
                 <p className="text-sm text-gray-400 mt-1">
                     {salesCount} {isRTL ? 'فاتورة' : 'Invoices'}
                 </p>
             </div>
        </div>

        {/* Card 2: Inventory Value */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-40">
             <div className="flex justify-between items-start">
                 <span className="text-gray-600 dark:text-gray-300 font-medium">
                     {isRTL ? 'قيمة المخزون' : 'Inventory Value'}
                 </span>
                 <div className="text-gray-400">
                     <Package size={22} />
                 </div>
             </div>
             <div className="mt-auto">
                 <div className="text-3xl font-bold text-gray-900 dark:text-white flex items-baseline gap-2">
                     {formatCurrency(inventoryValue)} 
                     <span className="text-lg font-normal text-gray-500">{isRTL ? 'ريال يمني' : 'YER'}</span>
                 </div>
                 <p className="text-sm text-gray-400 mt-1">
                     {productCount} {isRTL ? 'منتج' : 'Products'}
                 </p>
             </div>
        </div>

        {/* Card 3: Low Stock Alert */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-40">
             <div className="flex justify-between items-start">
                 <span className="text-gray-600 dark:text-gray-300 font-medium">
                     {isRTL ? 'تنبيه: منتجات منخفضة المخزون' : 'Alert: Low Stock'}
                 </span>
                 <div className="text-red-500">
                     <AlertTriangle size={22} />
                 </div>
             </div>
             <div className="mt-auto">
                 <div className="text-3xl font-bold text-red-600">
                     {lowStockCount}
                 </div>
                 <p className="text-sm text-gray-400 mt-1">
                     {isRTL ? 'منتجات تحتاج إعادة طلب' : 'Products need reordering'}
                 </p>
             </div>
        </div>

      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {isRTL ? 'نظرة عامة على المبيعات والمشتريات' : 'Sales & Purchase Overview'}
            </h2>
             {/* Legend */}
             <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-gray-600 dark:text-gray-300">{isRTL ? 'المبيعات' : 'Sales'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-gray-600 dark:text-gray-300">{isRTL ? 'المشتريات' : 'Purchases'}</span>
                </div>
            </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#1e293b' }}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#2563eb" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSales)" 
                name={isRTL ? "المبيعات" : "Sales"}
              />
              <Area 
                type="monotone" 
                dataKey="purchases" 
                stroke="#94a3b8" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPurchases)" 
                name={isRTL ? "المشتريات" : "Purchases"} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
