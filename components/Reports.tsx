
import React from 'react';
import { 
  Wallet, 
  TrendingDown, 
  Package, 
  TrendingUp 
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
  const { invoices, expenses } = useData();

  // Real Calculations
  const totalSales = invoices
    .filter(i => i.type === 'sale' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.total, 0);
  
  const totalPurchases = invoices
    .filter(i => i.type === 'purchase' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.total, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const netBalance = totalSales - totalPurchases - totalExpenses;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-YE' : 'en-US', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Generate Chart Data (Last 7 days dynamic)
  const generateChartData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const sales = invoices
            .filter(inv => inv.date === dateStr && inv.type === 'sale')
            .reduce((acc, inv) => acc + inv.total, 0);

        const purchases = invoices
            .filter(inv => inv.date === dateStr && inv.type === 'purchase')
            .reduce((acc, inv) => acc + inv.total, 0);

        days.push({
            name: dateStr.substring(5), // MM-DD
            sales,
            purchases
        });
    }
    return days;
  };

  const chartData = generateChartData();

  const cards = [
    {
      title: isRTL ? 'صافي الرصيد' : 'Net Balance',
      amount: netBalance,
      color: 'bg-blue-500',
      icon: Wallet,
      subtitle: isRTL ? 'الإجمالي' : 'Total'
    },
    {
      title: isRTL ? 'إجمالي المصروفات' : 'Total Expenses',
      amount: totalExpenses,
      color: 'bg-pink-500',
      icon: TrendingDown,
      subtitle: isRTL ? 'الإجمالي' : 'Total'
    },
    {
      title: isRTL ? 'إجمالي المشتريات' : 'Total Purchases',
      amount: totalPurchases,
      color: 'bg-orange-500',
      icon: Package,
      subtitle: isRTL ? 'الإجمالي' : 'Total'
    },
    {
      title: isRTL ? 'إجمالي المبيعات' : 'Total Sales',
      amount: totalSales,
      color: 'bg-green-500',
      icon: TrendingUp,
      subtitle: isRTL ? 'الإجمالي' : 'Total'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
            const Icon = card.icon;
            return (
                <div key={index} className={`${card.color} rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between h-40`}>
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Icon size={24} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium opacity-90 mb-1">{card.title}</h3>
                        <p className="text-xs opacity-75 mb-2">{card.subtitle}</p>
                        <div className="text-3xl font-bold flex items-baseline gap-1">
                            {formatCurrency(card.amount)}
                            <span className="text-base font-normal opacity-80">{isRTL ? 'ريال' : 'YER'}</span>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-8">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white text-right w-full">
                {isRTL ? 'نظرة عامة على المبيعات والمشتريات' : 'Sales & Purchase Overview'}
            </h2>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e2e8f0" />
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
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#eab308" 
                strokeWidth={3}
                dot={{ r: 6, fill: '#eab308', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
                name={isRTL ? "المبيعات" : "Sales"}
              />
              <Line 
                type="monotone" 
                dataKey="purchases" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
                name={isRTL ? "المشتريات" : "Purchases"} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend at bottom */}
        <div className="flex justify-center items-center gap-8 mt-6">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                <span className="text-gray-600 dark:text-gray-300 font-medium">{isRTL ? 'المشتريات' : 'Purchases'}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
                <span className="text-gray-600 dark:text-gray-300 font-medium">{isRTL ? 'المبيعات' : 'Sales'}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
