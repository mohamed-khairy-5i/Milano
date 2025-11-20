
import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, User, Printer } from 'lucide-react';
import { useData } from '../DataContext';
import { Product, CartItem } from '../types';

interface POSProps {
  isRTL: boolean;
}

const POS: React.FC<POSProps> = ({ isRTL }) => {
  const { products } = useData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Sync filtered products with actual products when they change or search changes
  useEffect(() => {
    if (products.length > 0) {
        const results = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(results);
    } else {
        setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.priceSell * item.quantity), 0);
  };

  const calculateTax = (total: number) => total * 0.00; // 0% tax for now, or make it configurable

  const subTotal = calculateTotal();
  const tax = calculateTax(subTotal);
  const total = subTotal + tax;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-4 overflow-hidden">
      
      {/* Products Grid */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
              placeholder={isRTL ? "بحث عن منتج..." : "Search products..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                    <div 
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="group cursor-pointer bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-primary hover:shadow-md transition-all"
                    >
                        <div className="aspect-square rounded-md overflow-hidden mb-3 bg-white dark:bg-gray-600 flex items-center justify-center">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <span className="text-gray-400 text-xs">{isRTL ? 'لا صورة' : 'No Image'}</span>
                            )}
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{product.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{product.code}</span>
                            <span className="font-bold text-primary">{product.priceSell}</span>
                        </div>
                    </div>
                ))}
                {filteredProducts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center text-gray-400 py-10">
                        <p>{isRTL ? 'لا توجد منتجات' : 'No products found'}</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-xl">
            <div className="flex items-center gap-2">
                <User size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'عميل عام' : 'Walk-in Customer'}</span>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{cart.length} {isRTL ? 'عناصر' : 'Items'}</span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <ShoppingCartIcon size={48} className="mb-2 opacity-20" />
                    <p>{isRTL ? 'السلة فارغة' : 'Cart is empty'}</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</h4>
                            <div className="text-xs text-gray-500 mt-1">{item.priceSell} x {item.quantity}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:text-red-500">
                                <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:text-green-500">
                                <Plus size={14} />
                            </button>
                            <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md ml-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Totals */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>{subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{isRTL ? 'الضريبة (0%)' : 'Tax (0%)'}</span>
                    <span>{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                    <span>{total.toLocaleString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    <CreditCard size={18} />
                    {isRTL ? 'دفع' : 'Pay Now'}
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">
                    <Printer size={18} />
                    {isRTL ? 'طباعة' : 'Print'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for empty state
const ShoppingCartIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
);

export default POS;
