
import React, { useState } from 'react';
import { RefreshCw, Search, Plus, ClipboardList, Package } from 'lucide-react';
import { useData } from '../DataContext';
import Modal from './Modal';

interface StockProps {
  isRTL: boolean;
}

const Stock: React.FC<StockProps> = ({ isRTL }) => {
  const { products, updateProduct, currency, invoices } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'movement'>('current');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustment, setAdjustment] = useState<{
    productId: string;
    store: string;
    type: 'increase' | 'decrease';
    quantity: number;
    notes: string;
  }>({
    productId: '',
    store: 'المخزن الرئيسي',
    type: 'increase',
    quantity: 0,
    notes: ''
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!adjustment.productId || adjustment.quantity <= 0) return;

    const product = products.find(p => p.id === adjustment.productId);
    if (!product) return;

    const currentStock = product.stock;
    const newStock = adjustment.type === 'increase' 
      ? currentStock + adjustment.quantity 
      : Math.max(0, currentStock - adjustment.quantity);

    updateProduct({ ...product, stock: newStock });
    setIsModalOpen(false);
    
    // Reset form
    setAdjustment({
      productId: '',
      store: 'المخزن الرئيسي',
      type: 'increase',
      quantity: 0,
      notes: ''
    });
  };

  const formatCurrency = (val: number) => {
    const currencyLabels: Record<string, string> = {
        'YER': isRTL ? 'ريال يمني' : 'YER',
        'SAR': isRTL ? 'ريال سعودي' : 'SAR',
        'USD': isRTL ? 'دولار' : 'USD',
    };
    return `${val.toLocaleString()} ${currencyLabels[currency]}`;
  };

  // Helper to calculate sold quantity
  const getSoldQuantity = (productId: string) => {
    return invoices
        .filter(i => i.type === 'sale' && i.status !== 'cancelled')
        .reduce((acc, inv) => {
            const item = inv.items?.find(i => i.productId === productId);
            return acc + (item ? item.quantity : 0);
        }, 0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
           {isRTL ? 'إدارة المخزون' : 'Stock Management'}
        </h2>

        <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('current')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'current' 
                        ? 'bg-white dark:bg-gray-600 shadow text-black dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <Package size={16} />
                    {isRTL ? 'المخزون الحالي' : 'Current Stock'}
                </button>
                <button
                    onClick={() => setActiveTab('movement')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'movement' 
                        ? 'bg-white dark:bg-gray-600 shadow text-black dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <ClipboardList size={16} />
                    {isRTL ? 'جرد الأصناف' : 'Inventory Count'}
                </button>
            </div>

            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm font-bold"
            >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">{isRTL ? 'تعديل سريع' : 'Adjust Stock'}</span>
            </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
         <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
                <Search size={18} />
            </div>
            <input 
                type="text" 
                className="block w-full md:w-96 p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                placeholder={isRTL ? "بحث في المخزون..." : "Search stock..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto border border-gray-100 dark:border-gray-700 rounded-lg">
        
        {/* View 1: Current Stock */}
        {activeTab === 'current' && (
            <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
                <thead className="text-xs text-gray-700 uppercase bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-bold sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الكود' : 'Code'}</th>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'المنتج' : 'Product'}</th>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'المخزن' : 'Store'}</th>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الكمية المتوفرة' : 'Available Qty'}</th>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'سعر التكلفة' : 'Cost Price'}</th>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'سعر البيع' : 'Selling Price'}</th>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'إجمالي القيمة' : 'Total Value'}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 text-end">{product.code}</td>
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-end">
                                {product.name}
                            </td>
                            <td className="px-6 py-4 text-end">
                                {isRTL ? 'المخزن الرئيسي' : 'Main Store'}
                            </td>
                            <td className={`px-6 py-4 text-end font-bold ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                {product.stock} {product.unit}
                            </td>
                            <td className="px-6 py-4 text-end">
                                {formatCurrency(product.priceBuy)}
                            </td>
                            <td className="px-6 py-4 text-end">
                                {formatCurrency(product.priceSell)}
                            </td>
                            <td className="px-6 py-4 text-end font-medium text-green-600">
                                {formatCurrency(product.stock * product.priceBuy)}
                            </td>
                        </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                                {isRTL ? 'لا توجد منتجات' : 'No products found'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}

        {/* View 2: Inventory Count / Movement */}
        {activeTab === 'movement' && (
            <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
                <thead className="text-xs text-gray-700 uppercase bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-bold sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'المنتج' : 'Product'}</th>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الكمية المباعة' : 'Sold Qty'}</th>
                        <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'المتبقي في المخزون' : 'Remaining Stock'}</th>
                        <th scope="col" className="px-6 py-4 text-center">{isRTL ? 'الحالة' : 'Status'}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {filteredProducts.map((product) => {
                        const soldQty = getSoldQuantity(product.id);
                        const isLowStock = product.stock <= product.minStock;
                        const isOutOfStock = product.stock === 0;

                        return (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-end">
                                    <div>{product.name}</div>
                                    <div className="text-xs text-gray-400">{product.code}</div>
                                </td>
                                <td className="px-6 py-4 text-end font-bold text-blue-600 bg-blue-50/50 dark:bg-blue-900/10">
                                    {soldQty} {product.unit}
                                </td>
                                <td className="px-6 py-4 text-end font-bold text-green-600 bg-green-50/50 dark:bg-green-900/10">
                                    {product.stock} {product.unit}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {isOutOfStock ? (
                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-bold">{isRTL ? 'نفذت الكمية' : 'Out of Stock'}</span>
                                    ) : isLowStock ? (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold">{isRTL ? 'منخفض' : 'Low Stock'}</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold">{isRTL ? 'متوفر' : 'In Stock'}</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {filteredProducts.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                {isRTL ? 'لا توجد بيانات' : 'No data found'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}

      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isRTL ? 'تعديل كمية المخزون' : 'Adjust Stock Quantity'}
        isRTL={isRTL}
        footer={
            <>
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleSave} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-bold">
                    {isRTL ? 'حفظ' : 'Save'}
                </button>
            </>
        }
      >
        <div className="space-y-4">
            {/* Row 1: Product and Store */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'المنتج' : 'Product'}</label>
                    <select 
                        value={adjustment.productId}
                        onChange={e => setAdjustment({ ...adjustment, productId: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    >
                        <option value="">{isRTL ? 'اختر منتج' : 'Select Product'}</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'المخزن' : 'Store'}</label>
                    <select 
                        value={adjustment.store}
                        onChange={e => setAdjustment({ ...adjustment, store: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    >
                        <option value="المخزن الرئيسي">{isRTL ? 'المخزن الرئيسي' : 'Main Store'}</option>
                    </select>
                </div>
            </div>

            {/* Row 2: Type and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'نوع التعديل' : 'Adjustment Type'}</label>
                    <select 
                        value={adjustment.type}
                        onChange={e => setAdjustment({ ...adjustment, type: e.target.value as 'increase' | 'decrease' })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    >
                        <option value="increase">{isRTL ? 'زيادة' : 'Increase'}</option>
                        <option value="decrease">{isRTL ? 'نقصان' : 'Decrease'}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الكمية' : 'Quantity'}</label>
                    <input 
                        type="number" 
                        value={adjustment.quantity}
                        onChange={e => setAdjustment({ ...adjustment, quantity: Number(e.target.value) })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            {/* Row 3: Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'ملاحظات' : 'Notes'}</label>
                <textarea 
                    rows={3}
                    value={adjustment.notes}
                    onChange={e => setAdjustment({ ...adjustment, notes: e.target.value })}
                    placeholder={isRTL ? '...سبب التعديل' : 'Reason for adjustment...'}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Stock;
