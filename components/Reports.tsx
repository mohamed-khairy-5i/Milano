
import React from 'react';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp,
  ShoppingBag,
  PiggyBank
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useData } from '../DataContext';

interface ReportsProps {
  isRTL: boolean;
}

const Reports: React.FC<ReportsProps> = ({ isRTL }) => {
  const { invoices, expenses, products, currency } = useData();

  // --- Calculations ---

  // 1. Total Sales Revenue
  const totalSales = invoices
    .filter(i => i.type === 'sale' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.total, 0);
  
  // 2. Total Purchases (Expenditure on stock)
  const totalPurchases = invoices
    .filter(i => i.type === 'purchase' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.total, 0);

  // 3. Total Operational Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 4. Cash Balance (Cash Flow: In - Out)
  const cashBalance = totalSales - totalPurchases - totalExpenses;
  
  // 5. Calculate Net Profit based on Cost of Goods Sold (COGS)
  const calculateNetProfit = () => {
    let grossProfit = 0;

    const salesInvoices = invoices.filter(i => i.type === 'sale' && i.status !== 'cancelled');

    salesInvoices.forEach(inv => {
        if (inv.items && inv.items.length > 0) {
            inv.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                const costPrice = product ? product.priceBuy : 0;
                
                const itemRevenue = (item.price * item.quantity) - (item.discount || 0);
                const itemCost = costPrice * item.quantity;

                grossProfit += (itemRevenue - itemCost);
            });
        }
    });

    return grossProfit - totalExpenses;
  };

  const netProfit = calculateNetProfit();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-YE' : 'en-US', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(val);
  };

  const currencyLabels: Record<string, string> = {
      'YER': isRTL ? 'ريال يمني' : 'YER',
      'SAR': isRTL ? 'ريال سعودي' : 'SAR',
      'USD': isRTL ? 'دولار' : 'USD',
  };
  const currencyLabel = currencyLabels[currency];

  // Generate Chart Data (Last 7 days)
  const generateChartData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        // Sales for the day
        const sales = invoices
            .filter(inv => inv.date === dateStr && inv.type === 'sale')
            .reduce((acc, inv) => acc + inv.total, 0);
        
        // Calculate daily profit
        let dailyProfit = 0;
        const daySales = invoices.filter(inv => inv.date === dateStr && inv.type === 'sale');
        daySales.forEach(inv => {
            if(inv.items) {
                 inv.items.forEach(item => {
                    const product = products.find(p => p.id === item.productId);
                    const cost = product ? product.priceBuy : 0;
                    dailyProfit += ((item.price * item.quantity) - (item.discount || 0)) - (cost * item.quantity);
                 });
            }
        });
        const dayExpenses = expenses.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0);
        
        days.push({
            name: dateStr.substring(5),
            sales,
            profit: dailyProfit - dayExpenses
        });
    }
    return days;
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-8 animate-fade-in pb-8">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRTL ? 'التقارير المالية' : 'Financial Reports'}
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Cash Balance (Blue) */}
          <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden min-h-[160px] flex flex-col justify-between">
               <div className="absolute -top-4 -right-4 p-4 opacity-20 rotate-12">
                   <Wallet size={100} />
               </div>
               <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Wallet size={24} className="text-white" />
                        </div>
                        <span className="text-blue-100 text-sm font-semibold uppercase tracking-wider">{isRTL ? 'الرصيد الحالي' : 'Cash Balance'}</span>
                    </div>
                    <div className="mt-auto text-end">
                        <span className="text-4xl font-bold flex items-baseline justify-end gap-2">
                            {formatCurrency(cashBalance)} <span className="text-lg font-normal text-blue-200">{currencyLabel}</span>
                        </span>
                    </div>
               </div>
          </div>

          {/* Card 2: Total Purchases (Orange) */}
          <div className="bg-orange-500 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden min-h-[160px] flex flex-col justify-between">
               <div className="absolute -top-4 -right-4 p-4 opacity-20 rotate-12">
                   <ShoppingBag size={100} />
               </div>
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <ShoppingBag size={24} className="text-white" />
                        </div>
                        <span className="text-orange-100 text-sm font-semibold uppercase tracking-wider">{isRTL ? 'إجمالي المشتريات' : 'Total Purchases'}</span>
                   </div>
                   <div className="mt-auto text-end">
                        <span className="text-4xl font-bold flex items-baseline justify-end gap-2">
                            {formatCurrency(totalPurchases)} <span className="text-lg font-normal text-orange-200">{currencyLabel}</span>
                        </span>
                   </div>
               </div>
          </div>

          {/* Card 3: Total Sales (Green) */}
          <div className="bg-green-500 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden min-h-[160px] flex flex-col justify-between">
               <div className="absolute -top-4 -right-4 p-4 opacity-20 rotate-12">
                   <TrendingUp size={100} />
               </div>
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <TrendingUp size={24} className="text-white" />
                        </div>
                        <span className="text-green-100 text-sm font-semibold uppercase tracking-wider">{isRTL ? 'إجمالي المبيعات' : 'Total Sales'}</span>
                   </div>
                   <div className="mt-auto text-end">
                        <span className="text-4xl font-bold flex items-baseline justify-end gap-2">
                            {formatCurrency(totalSales)} <span className="text-lg font-normal text-green-200">{currencyLabel}</span>
                        </span>
                   </div>
               </div>
          </div>

          {/* Card 4: Net Profit (Cyan/Sky) */}
          <div className="bg-cyan-500 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden min-h-[160px] flex flex-col justify-between">
               <div className="absolute -top-4 -right-4 p-4 opacity-20 rotate-12">
                   <PiggyBank size={100} />
               </div>
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <PiggyBank size={24} className="text-white" />
                        </div>
                        <span className="text-cyan-100 text-sm font-semibold uppercase tracking-wider">{isRTL ? 'صافي الربح' : 'Net Profit'}</span>
                   </div>
                   <div className="mt-auto text-end">
                        <span className="text-4xl font-bold flex items-baseline justify-end gap-2">
                            {formatCurrency(netProfit)} <span className="text-lg font-normal text-cyan-100">{currencyLabel}</span>
                        </span>
                   </div>
               </div>
          </div>

           {/* Card 5: Total Expenses (Red) */}
           <div className="bg-red-500 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden min-h-[160px] flex flex-col justify-between">
               <div className="absolute -top-4 -right-4 p-4 opacity-20 rotate-12">
                   <TrendingDown size={100} />
               </div>
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <TrendingDown size={24} className="text-white" />
                        </div>
                         <span className="text-red-100 text-sm font-semibold uppercase tracking-wider">{isRTL ? 'إجمالي المصروفات' : 'Total Expenses'}</span>
                   </div>
                   <div className="mt-auto text-end">
                        <span className="text-4xl font-bold flex items-baseline justify-end gap-2">
                            {formatCurrency(totalExpenses)} <span className="text-lg font-normal text-red-200">{currencyLabel}</span>
                        </span>
                   </div>
               </div>
          </div>
      </div>
        
      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isRTL ? 'الأرباح والمبيعات (آخر 7 أيام)' : 'Profit & Sales (Last 7 Days)'}
            </h3>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                name={isRTL ? "المبيعات" : "Sales"}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                name={isRTL ? "صافي الربح" : "Net Profit"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
