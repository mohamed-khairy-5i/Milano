
import React, { useState } from 'react';
import { Edit, Trash2, Plus, Search, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Product } from '../types';
import { useData } from '../DataContext';
import Modal from './Modal';

interface InventoryProps {
  isRTL: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ isRTL }) => {
  const { products, addProduct, updateProduct, deleteProduct, currency } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isEditing, setIsEditing] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setCurrentProduct({
      code: '',
      name: '',
      category: '',
      priceBuy: 0,
      priceSell: 0,
      stock: 0,
      minStock: 0,
      maxStock: 0,
      unit: 'قطعة',
      image: '',
      description: '',
      barcode: ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentProduct.name || !currentProduct.code) return;

    if (isEditing && currentProduct.id) {
      updateProduct(currentProduct as Product);
    } else {
      addProduct(currentProduct as Omit<Product, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      deleteProduct(id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentProduct({ ...currentProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCurrency = (val: number) => {
    const currencyLabels: Record<string, string> = {
        'YER': isRTL ? 'ريال يمني' : 'YER',
        'SAR': isRTL ? 'ريال سعودي' : 'SAR',
        'USD': isRTL ? 'دولار' : 'USD',
    };
    return `${val.toLocaleString()} ${currencyLabels[currency]}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
      
      {/* Header Actions */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
           {isRTL ? 'المنتجات' : 'Products'}
        </h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
             {/* Search Bar */}
            <div className="relative flex-1 sm:flex-none">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
                    <Search size={18} />
                </div>
                <input 
                    type="text" 
                    className="block w-full sm:w-64 p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    placeholder={isRTL ? "بحث عن منتج..." : "Search products..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button 
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm font-bold shrink-0"
            >
                <Plus size={18} />
                <span>{isRTL ? 'إنشاء منتج' : 'Create Product'}</span>
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-gray-100 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
            <thead className="text-xs text-gray-700 uppercase bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-bold sticky top-0 z-10">
                <tr>
                    <th scope="col" className="px-6 py-4 text-center w-20">{isRTL ? 'صورة' : 'Image'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الكود' : 'Code'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الاسم' : 'Name'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الفئة' : 'Category'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الكمية' : 'Stock'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'سعر التكلفة' : 'Cost Price'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'سعر البيع' : 'Selling Price'}</th>
                    <th scope="col" className="px-6 py-4 text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group" onClick={() => handleOpenEdit(product)}>
                        <td className="px-6 py-4 text-center">
                            <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden mx-auto bg-gray-50 flex items-center justify-center">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={20} className="text-gray-400" />
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-end">{product.code}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-end">
                            {product.name}
                        </td>
                        <td className="px-6 py-4 text-end">
                            {product.category}
                        </td>
                        <td className={`px-6 py-4 text-end font-bold ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {product.stock} {product.unit}
                        </td>
                        <td className="px-6 py-4 text-end">{formatCurrency(product.priceBuy)}</td>
                        <td className="px-6 py-4 text-end font-medium">{formatCurrency(product.priceSell)}</td>
                        <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(product); }}
                                    className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600"
                                >
                                    <Edit size={16} />
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(product.id, e)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {filteredProducts.length === 0 && (
                    <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                            {isRTL ? 'لا توجد منتجات' : 'No products found'}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? (isRTL ? 'تعديل منتج' : 'Edit Product') : (isRTL ? 'إنشاء منتج' : 'Create Product')}
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
        {/* Form Body */}
        <div className="space-y-4">
            
            {/* Image Upload Section */}
            <div className="flex items-center gap-4 mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-white dark:bg-gray-800 relative group">
                    {currentProduct.image ? (
                        <>
                            <img src={currentProduct.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setCurrentProduct({...currentProduct, image: ''})}>
                                <X size={20} className="text-white" />
                            </div>
                        </>
                    ) : (
                        <ImageIcon size={24} className="text-gray-400" />
                    )}
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isRTL ? 'صورة المنتج' : 'Product Image'}
                    </label>
                    <div className="flex gap-2">
                        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <Upload size={16} />
                            <span className="text-sm">{isRTL ? 'رفع صورة' : 'Upload Image'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        {/* Optional URL input if needed */}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{isRTL ? 'يفضل صور مربعة صغيرة' : 'Small square images preferred'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? '* الاسم' : 'Name *'}</label>
                    <input 
                        type="text" 
                        value={currentProduct.name || ''}
                        onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? '* الكود' : 'Code *'}</label>
                    <input 
                        type="text" 
                        value={currentProduct.code || ''}
                        onChange={e => setCurrentProduct({...currentProduct, code: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الباركود' : 'Barcode'}</label>
                    <input 
                        type="text" 
                        value={currentProduct.barcode || ''}
                        onChange={e => setCurrentProduct({...currentProduct, barcode: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الفئة' : 'Category'}</label>
                    <input 
                        type="text" 
                        value={currentProduct.category || ''}
                        onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? '* الوحدة' : 'Unit *'}</label>
                    <input 
                        type="text" 
                        value={currentProduct.unit || ''}
                        onChange={e => setCurrentProduct({...currentProduct, unit: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? '* سعر التكلفة' : 'Cost Price *'}</label>
                    <input 
                        type="number" 
                        value={currentProduct.priceBuy || ''}
                        onChange={e => setCurrentProduct({...currentProduct, priceBuy: Number(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? '* سعر البيع' : 'Selling Price *'}</label>
                    <input 
                        type="number" 
                        value={currentProduct.priceSell || ''}
                        onChange={e => setCurrentProduct({...currentProduct, priceSell: Number(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الحد الأدنى للمخزون' : 'Min Stock'}</label>
                    <input 
                        type="number" 
                        value={currentProduct.minStock}
                        onChange={e => setCurrentProduct({...currentProduct, minStock: Number(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الحد الأقصى للمخزون' : 'Max Stock'}</label>
                    <input 
                        type="number" 
                        value={currentProduct.maxStock}
                        onChange={e => setCurrentProduct({...currentProduct, maxStock: Number(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الوصف' : 'Description'}</label>
                 <textarea 
                    rows={3}
                    value={currentProduct.description || ''}
                    onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
