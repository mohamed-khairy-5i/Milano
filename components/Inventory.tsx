
import React, { useState } from 'react';
import { Edit, Trash2, Eye, Plus, Filter, Download, Save } from 'lucide-react';
import { Product } from '../types';
import { useData } from '../DataContext';
import Modal from './Modal';

interface InventoryProps {
  isRTL: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ isRTL }) => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
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
      image: 'https://picsum.photos/200/200?random=' + Math.random(),
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

  const handleDelete = (id: string) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      deleteProduct(id);
    }
  };

  const formatCurrency = (val: number) => {
    return `${val.toLocaleString()} ريال يمني`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
      
      {/* Header Actions */}
      <div className="mb-6 flex flex-row justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
           {isRTL ? 'المنتجات' : 'Products'}
        </h2>
        
        <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm font-bold"
        >
            <Plus size={18} />
            <span>{isRTL ? 'إنشاء منتج' : 'Create Product'}</span>
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-gray-100 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
            <thead className="text-xs text-gray-700 uppercase bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-bold">
                <tr>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الكود' : 'Code'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الاسم' : 'Name'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الفئة' : 'Category'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الوحدة' : 'Unit'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'سعر التكلفة' : 'Cost Price'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'سعر البيع' : 'Selling Price'}</th>
                    {/* Hidden in screenshot but typically needed, keeping hidden to match exact look or show? Screenshot 1 ends at Selling Price on left. */}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group" onClick={() => handleOpenEdit(product)}>
                        <td className="px-6 py-4 text-end">{product.code}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-end">
                            {product.name}
                        </td>
                        <td className="px-6 py-4 text-end">
                            {product.category}
                        </td>
                        <td className="px-6 py-4 text-end">
                            {product.unit}
                        </td>
                        <td className="px-6 py-4 text-end">{formatCurrency(product.priceBuy)}</td>
                        <td className="px-6 py-4 text-end font-medium">{formatCurrency(product.priceSell)}</td>
                    </tr>
                ))}
                {filteredProducts.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
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
        <div className="space-y-4">
            {/* Row 1: Name and Code */}
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

            {/* Row 2: Barcode and Category */}
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

             {/* Row 3: Unit and Cost Price */}
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

            {/* Row 4: Sell Price and Min Stock */}
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

            {/* Row 5: Max Stock and Spacer */}
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
                <div></div>
            </div>

            {/* Row 6: Description */}
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
