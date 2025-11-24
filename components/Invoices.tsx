
import React, { useState } from 'react';
import { Plus, Eye, Trash2, Printer, Filter, Search, Edit, FileText } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { useData } from '../DataContext';
import Modal from './Modal';

interface InvoicesProps {
  isRTL: boolean;
  type?: 'sale' | 'purchase';
}

const Invoices: React.FC<InvoicesProps> = ({ isRTL, type = 'sale' }) => {
  const { invoices, contacts, products, addInvoice, updateInvoice, deleteInvoice, currency } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Labels
  const pageTitle = type === 'sale' ? (isRTL ? 'المبيعات' : 'Sales') : (isRTL ? 'المشتريات' : 'Purchases');
  const createBtnLabel = type === 'sale' ? (isRTL ? 'إنشاء فاتورة بيع' : 'Create Sale Invoice') : (isRTL ? 'إنشاء فاتورة شراء' : 'Create Purchase Invoice');
  const editBtnLabel = type === 'sale' ? (isRTL ? 'تعديل فاتورة بيع' : 'Edit Sale Invoice') : (isRTL ? 'تعديل فاتورة شراء' : 'Edit Purchase Invoice');
  const contactLabel = type === 'sale' ? (isRTL ? 'العميل' : 'Customer') : (isRTL ? 'المورد' : 'Supplier');
  const selectContactLabel = type === 'sale' ? (isRTL ? 'اختر عميل' : 'Select Customer') : (isRTL ? 'اختر مورد' : 'Select Supplier');
  const priceLabel = type === 'sale' ? (isRTL ? 'سعر البيع' : 'Selling Price') : (isRTL ? 'سعر التكلفة' : 'Cost Price');

  // State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState<{
    contactId: string;
    date: string;
    dueDate: string;
    items: { productId: string; productName: string; quantity: number; price: number; discount: number }[];
    tax: number;
    status: 'paid' | 'pending' | 'credit';
    notes: string;
    currentLineItem: { productId: string; quantity: number; price: number; discount: number };
  }>({
    contactId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    items: [],
    tax: 0,
    status: 'paid', 
    notes: '',
    currentLineItem: { productId: '', quantity: 1, price: 0, discount: 0 }
  });

  // Filter AND Sort Invoices (Newest First)
  const filteredInvoices = invoices
    .filter(inv => 
      (inv.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inv.contactName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      inv.type === type
    )
    .sort((a, b) => {
        // 1. Date Check
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;

        // 2. CreatedAt Check (New vs Old) - Prefer items with timestamp
        if (a.createdAt && !b.createdAt) return -1; // a is newer
        if (!a.createdAt && b.createdAt) return 1;  // b is newer

        // 3. Both have createdAt: Compare exact times
        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        // 4. Fallback
        return b.number.localeCompare(a.number);
    });

  // Calculate Screen Totals
  const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalRemaining = filteredInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);
  const totalQuantity = filteredInvoices.reduce((sum, i) => sum + (i.items?.reduce((acc, item) => acc + item.quantity, 0) || 0), 0);

  const availableContacts = contacts.filter(c => c.type === (type === 'sale' ? 'customer' : 'supplier'));

  const formatCurrency = (val: number) => {
    const currencyLabels: Record<string, string> = {
        'YER': isRTL ? 'ريال يمني' : 'YER',
        'SAR': isRTL ? 'ريال سعودي' : 'SAR',
        'USD': isRTL ? 'دولار' : 'USD',
        'AED': isRTL ? 'درهم إماراتي' : 'AED',
    };
    return `${val.toLocaleString()} ${currencyLabels[currency]}`;
  };

  const handleOpenAdd = () => {
      setEditingId(null);
      setNewInvoiceData({
        contactId: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        items: [],
        tax: 0,
        status: 'paid',
        notes: '',
        currentLineItem: { productId: '', quantity: 1, price: 0, discount: 0 }
      });
      setIsModalOpen(true);
  };

  const handleEdit = (invoice: Invoice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(invoice.id);
    setNewInvoiceData({
        contactId: invoice.contactId,
        date: invoice.date,
        dueDate: invoice.dueDate || invoice.date,
        items: invoice.items?.map(i => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
            discount: i.discount || 0
        })) || [],
        tax: invoice.tax,
        status: invoice.status === 'cancelled' ? 'pending' : invoice.status as any,
        notes: invoice.notes || '',
        currentLineItem: { productId: '', quantity: 1, price: 0, discount: 0 }
    });
    setIsModalOpen(true);
  };

  const handleAddLineItem = () => {
    if (newInvoiceData.currentLineItem.productId) {
      const product = products.find(p => p.id === newInvoiceData.currentLineItem.productId);
      setNewInvoiceData({
        ...newInvoiceData,
        items: [...newInvoiceData.items, {
            ...newInvoiceData.currentLineItem,
            productName: product?.name || 'Unknown Product'
        }],
        currentLineItem: { productId: '', quantity: 1, price: 0, discount: 0 }
      });
    }
  };

  const handleSaveInvoice = () => {
    // ... existing save logic
    if (!newInvoiceData.contactId) return;

    const selectedContact = contacts.find(c => c.id === newInvoiceData.contactId);
    const totalBeforeTax = newInvoiceData.items.reduce((acc, item) => acc + (item.quantity * item.price) - item.discount, 0);
    const total = totalBeforeTax + newInvoiceData.tax;
    
    const prefix = type === 'sale' ? 'INV' : 'PUR';

    let paidAmount = 0;
    if (newInvoiceData.status === 'paid') {
        paidAmount = total;
    } else {
        paidAmount = 0; 
    }
    const remainingAmount = total - paidAmount;

    const savedItems: InvoiceItem[] = newInvoiceData.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        total: (item.quantity * item.price) - item.discount
    }));

    if (editingId) {
        const existingInvoice = invoices.find(i => i.id === editingId);
        if (existingInvoice) {
            updateInvoice({
                id: editingId,
                storeId: existingInvoice.storeId,
                number: existingInvoice.number || '',
                date: newInvoiceData.date,
                dueDate: newInvoiceData.dueDate,
                contactName: selectedContact?.name || 'Unknown',
                contactId: newInvoiceData.contactId,
                total: total,
                paidAmount: paidAmount, 
                remainingAmount: remainingAmount,
                tax: newInvoiceData.tax,
                status: newInvoiceData.status,
                type: type,
                itemsCount: newInvoiceData.items.length,
                items: savedItems,
                notes: newInvoiceData.notes
            });
        }
    } else {
        addInvoice({
            number: `${prefix}-${Date.now().toString().substr(-4)}`, 
            date: newInvoiceData.date,
            dueDate: newInvoiceData.dueDate,
            contactName: selectedContact?.name || 'Unknown',
            contactId: newInvoiceData.contactId,
            total: total,
            paidAmount: paidAmount, 
            remainingAmount: remainingAmount,
            tax: newInvoiceData.tax,
            status: newInvoiceData.status,
            type: type,
            itemsCount: newInvoiceData.items.length,
            createdAt: new Date().toISOString(), // Add createdAt
            items: savedItems,
            notes: newInvoiceData.notes
        });
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
        deleteInvoice(id);
    }
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) return;

    const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.total, 0);
    const totalPaid = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalRemaining = filteredInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);
    const totalQuantityAll = filteredInvoices.reduce((sum, i) => sum + (i.items?.reduce((acc, item) => acc + item.quantity, 0) || 0), 0);

    const direction = isRTL ? 'rtl' : 'ltr';
    const textAlign = isRTL ? 'right' : 'left';
    const title = type === 'sale' ? (isRTL ? 'تقرير المبيعات' : 'Sales Report') : (isRTL ? 'تقرير المشتريات' : 'Purchases Report');
    const currencySymbol = currency;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
          <title>${title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Cairo', sans-serif; padding: 20px; }
              h2 { text-align: center; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px; }
              th { background: #f3f4f6; padding: 10px; text-align: ${textAlign}; border-bottom: 2px solid #ccc; }
              td { padding: 8px; border-bottom: 1px solid #eee; }
              .total-row { font-weight: bold; background: #f9fafb; }
              @media print { .print-btn { display: none; } }
          </style>
      </head>
      <body>
          <button class="print-btn" onclick="window.print()" style="padding: 10px 20px; margin-bottom: 20px; cursor: pointer;">${isRTL ? 'طباعة التقرير' : 'Print Report'}</button>
          <h2>${title}</h2>
          <div>${isRTL ? 'تاريخ التقرير: ' : 'Date: '} ${new Date().toLocaleString()}</div>
          
          <table>
              <thead>
                  <tr>
                      <th>${isRTL ? 'الكود' : 'Code'}</th>
                      <th>${isRTL ? 'رقم الفاتورة' : 'Invoice #'}</th>
                      <th>${contactLabel}</th>
                      <th>${isRTL ? 'التاريخ' : 'Date'}</th>
                      <th>${isRTL ? 'الكمية' : 'Qty'}</th>
                      <th>${isRTL ? 'الإجمالي' : 'Total'}</th>
                      <th>${isRTL ? 'المدفوع' : 'Paid'}</th>
                      <th>${isRTL ? 'المتبقي' : 'Remaining'}</th>
                      <th>${isRTL ? 'الحالة' : 'Status'}</th>
                  </tr>
              </thead>
              <tbody>
                  ${filteredInvoices.map((inv, index) => {
                      const totalQty = inv.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
                      return `
                      <tr>
                          <td>${index + 1}</td>
                          <td>${inv.number}</td>
                          <td>${inv.contactName}</td>
                          <td>${inv.date}</td>
                          <td>${totalQty}</td>
                          <td>${inv.total.toLocaleString()}</td>
                          <td style="color: green;">${inv.paidAmount.toLocaleString()}</td>
                          <td style="color: red;">${inv.remainingAmount.toLocaleString()}</td>
                          <td>
                              ${isRTL 
                                ? (inv.status === 'paid' ? 'مدفوع' : inv.status === 'credit' ? 'آجل' : inv.status === 'pending' ? 'معلق' : 'ملغي')
                                : (inv.status === 'credit' ? 'Credit' : inv.status.toUpperCase())
                              }
                          </td>
                      </tr>
                  `}).join('')}
              </tbody>
              <tfoot>
                  <tr class="total-row">
                      <td colspan="4" style="text-align: center;">${isRTL ? 'الإجمالي' : 'Total'}</td>
                      <td>${totalQuantityAll}</td>
                      <td>${totalAmount.toLocaleString()} ${currencySymbol}</td>
                      <td style="color: green;">${totalPaid.toLocaleString()} ${currencySymbol}</td>
                      <td style="color: red;">${totalRemaining.toLocaleString()} ${currencySymbol}</td>
                      <td></td>
                  </tr>
              </tfoot>
          </table>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrint = (invoice: Invoice, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      // ... existing print logic ...
      const contact = contacts.find(c => c.id === invoice.contactId);
      const contactPhone = contact?.phone || '';
      const contactAddress = contact?.address || '';

      const printWindow = window.open('', '_blank', 'width=900,height=800');
      if (!printWindow) {
          alert(isRTL ? 'يرجى السماح بالنوافذ المنبثقة للطباعة' : 'Please allow popups to print');
          return;
      }

      const currencySymbol = currency;
      const direction = isRTL ? 'rtl' : 'ltr';
      const textAlign = isRTL ? 'right' : 'left';

      const htmlContent = `
        <!DOCTYPE html>
        <html dir="${direction}">
        <head>
            <title>${isRTL ? 'فاتورة' : 'Invoice'} #${invoice.number}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Cairo', sans-serif; background: #f0f0f0; padding: 20px; }
                .invoice-container { background: white; max-width: 800px; margin: 0 auto; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
                .meta { text-align: ${isRTL ? 'left' : 'right'}; }
                .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
                .info-box { flex: 1; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
                .info-title { font-weight: bold; margin-bottom: 10px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { background: #f3f4f6; padding: 15px; text-align: ${textAlign}; border-bottom: 2px solid #e5e7eb; font-size: 14px; color: #374151; font-weight: bold; }
                td { padding: 15px; border-bottom: 1px solid #eee; font-size: 14px; color: #1f2937; }
                tr:last-child td { border-bottom: none; }
                .totals { width: 300px; margin-${isRTL ? 'right' : 'left'}: auto; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
                .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
                .total-row.final { font-weight: bold; font-size: 20px; border-top: 2px solid #2563eb; margin-top: 10px; padding-top: 10px; color: #2563eb; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 20px; }
                .print-btn { display: block; width: 100%; padding: 15px; background: #2563eb; color: white; border: none; cursor: pointer; font-size: 16px; font-weight: bold; margin-bottom: 20px; border-radius: 8px; }
                .print-btn:hover { background: #1d4ed8; }
                @media print {
                    body { background: white; padding: 0; }
                    .invoice-container { box-shadow: none; padding: 0; }
                    .print-btn { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <button class="print-btn" onclick="window.print()">${isRTL ? 'طباعة / حفظ PDF' : 'Print / Save as PDF'}</button>
                
                <div class="header">
                    <div class="logo">Milano Store</div>
                    <div class="meta">
                        <div style="font-size: 20px; font-weight: bold; color: #111827;">${type === 'sale' ? (isRTL ? 'فاتورة مبيعات' : 'SALES INVOICE') : (isRTL ? 'فاتورة مشتريات' : 'PURCHASE INVOICE')}</div>
                        <div style="margin-top: 5px; color: #6b7280;"># ${invoice.number}</div>
                        <div style="color: #6b7280;">${invoice.date}</div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-box">
                        <div class="info-title">${isRTL ? 'من' : 'From'}</div>
                        <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">Milano Store</div>
                        <div style="color: #4b5563;">Main Street, City Center</div>
                        <div style="color: #4b5563;">+967 777 000 000</div>
                    </div>
                    <div class="info-box">
                        <div class="info-title">${isRTL ? 'إلى' : 'To'}</div>
                        <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${invoice.contactName}</div>
                        <div style="color: #4b5563;">${contactPhone}</div>
                        <div style="color: #4b5563;">${contactAddress}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th width="50%">${isRTL ? 'المنتج' : 'Product'}</th>
                            <th width="15%">${isRTL ? 'الكمية' : 'Qty'}</th>
                            <th width="15%">${isRTL ? 'السعر' : 'Price'}</th>
                            <th width="20%">${isRTL ? 'الإجمالي' : 'Total'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items && invoice.items.length > 0 ? invoice.items.map(item => `
                        <tr>
                            <td>
                                <div style="font-weight: bold;">${item.productName}</div>
                            </td>
                            <td>${item.quantity}</td>
                            <td>${item.price.toLocaleString()}</td>
                            <td style="font-weight: bold;">${(item.quantity * item.price - item.discount).toLocaleString()}</td>
                        </tr>
                        `).join('') : `
                        <tr>
                            <td colspan="4" style="text-align: center; color: #9ca3af; padding: 30px;">
                                ${isRTL ? 'لا توجد تفاصيل محفوظة لهذه الفاتورة (سجل قديم)' : 'No detailed items saved for this invoice (Legacy record)'}
                            </td>
                        </tr>
                        `}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>${isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span>${(invoice.total - invoice.tax).toLocaleString()} ${currencySymbol}</span>
                    </div>
                    <div class="total-row">
                        <span>${isRTL ? 'الضريبة' : 'Tax'}</span>
                        <span>${invoice.tax.toLocaleString()} ${currencySymbol}</span>
                    </div>
                    <div class="total-row final">
                        <span>${isRTL ? 'الإجمالي' : 'Total'}</span>
                        <span>${invoice.total.toLocaleString()} ${currencySymbol}</span>
                    </div>
                    <div class="total-row" style="color: #059669; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e5e7eb;">
                        <span>${isRTL ? 'المدفوع' : 'Paid'}</span>
                        <span>${invoice.paidAmount.toLocaleString()} ${currencySymbol}</span>
                    </div>
                    <div class="total-row" style="color: #dc2626;">
                        <span>${isRTL ? 'المتبقي' : 'Remaining'}</span>
                        <span>${invoice.remainingAmount.toLocaleString()} ${currencySymbol}</span>
                    </div>
                </div>

                ${invoice.notes ? `
                <div style="margin-top: 30px; padding: 20px; background: #fffbeb; border-radius: 8px; border: 1px solid #fcd34d;">
                    <strong style="color: #b45309; display: block; margin-bottom: 5px;">${isRTL ? 'ملاحظات:' : 'Notes:'}</strong> 
                    <span style="color: #92400e;">${invoice.notes}</span>
                </div>
                ` : ''}

                <div class="footer">
                    ${isRTL ? 'شكراً لتعاملكم معنا' : 'Thank you for your business'}
                </div>
            </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
           {pageTitle}
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
                    placeholder={isRTL ? "بحث برقم الفاتورة أو الاسم..." : "Search invoice # or name..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button 
                onClick={handlePrintReport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm text-sm font-bold shrink-0"
            >
                <FileText size={18} />
                <span className="hidden sm:inline">{isRTL ? 'تقرير شامل' : 'Full Report'}</span>
            </button>

            <button 
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm font-bold shrink-0"
            >
                <Plus size={18} />
                <span>{createBtnLabel}</span>
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-gray-100 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
            <thead className="text-xs text-gray-700 uppercase bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-bold sticky top-0">
                <tr>
                    <th scope="col" className="px-6 py-4 text-start w-16">{isRTL ? 'الكود' : 'Code'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'رقم الفاتورة' : 'Invoice #'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{contactLabel}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'التاريخ' : 'Date'}</th>
                    <th scope="col" className="px-6 py-4 text-center">{isRTL ? 'الكمية' : 'Quantity'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'الإجمالي' : 'Total'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'المدفوع' : 'Paid'}</th>
                    <th scope="col" className="px-6 py-4 text-end">{isRTL ? 'المتبقي' : 'Remaining'}</th>
                    <th scope="col" className="px-6 py-4 text-center">{isRTL ? 'الحالة' : 'Status'}</th>
                    <th scope="col" className="px-6 py-4 text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filteredInvoices.map((invoice, index) => {
                    const totalQty = invoice.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
                    return (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-start">
                            {index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-end">
                            {invoice.number}
                        </td>
                        <td className="px-6 py-4 text-end">
                            {invoice.contactName}
                        </td>
                        <td className="px-6 py-4 text-end text-gray-500">
                            {invoice.date}
                        </td>
                        <td className="px-6 py-4 text-center font-medium">
                             {totalQty}
                        </td>
                        <td className="px-6 py-4 text-end font-bold text-gray-900 dark:text-white">
                            {formatCurrency(invoice.total)}
                        </td>
                        <td className="px-6 py-4 text-end text-green-600 font-medium">
                             {formatCurrency(invoice.paidAmount)}
                        </td>
                        <td className="px-6 py-4 text-end text-red-600 font-medium">
                             {formatCurrency(invoice.remainingAmount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                             <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                  (invoice.status === 'credit' || invoice.status === 'pending') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                {isRTL 
                                  ? (invoice.status === 'paid' ? 'مدفوع' : invoice.status === 'credit' ? 'آجل' : invoice.status === 'pending' ? 'معلق' : 'ملغي')
                                  : (invoice.status === 'credit' ? 'Credit' : invoice.status.toUpperCase())
                                }
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <button 
                                    onClick={(e) => handleEdit(invoice, e)}
                                    className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600"
                                    title={isRTL ? 'تعديل' : 'Edit'}
                                    type="button"
                                >
                                    <Edit size={16} />
                                </button>
                                <button 
                                    onClick={(e) => handlePrint(invoice, e)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                                    title={isRTL ? 'طباعة' : 'Print'}
                                    type="button"
                                >
                                    <Printer size={16} />
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(invoice.id, e)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                                    title={isRTL ? 'حذف' : 'Delete'}
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )})}
                {filteredInvoices.length === 0 && (
                    <tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-gray-400">
                            {isRTL ? 'لا توجد فواتير' : 'No invoices found'}
                        </td>
                    </tr>
                )}
            </tbody>
            {/* Table Footer with Summaries */}
            <tfoot className="bg-gray-50 dark:bg-gray-900/50 font-bold border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
                 <tr>
                    <td colSpan={4} className="px-6 py-4 text-end font-bold">{isRTL ? 'الإجمالي' : 'Total'}</td>
                    <td className="px-6 py-4 text-center font-bold bg-blue-50/50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300">
                        {totalQuantity}
                    </td>
                    <td className="px-6 py-4 text-end font-bold text-gray-900 dark:text-white">
                        {formatCurrency(totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-end font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(totalPaid)}
                    </td>
                    <td className="px-6 py-4 text-end font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(totalRemaining)}
                    </td>
                    <td colSpan={2}></td>
                </tr>
            </tfoot>
        </table>
      </div>

      {/* Create/Edit Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? editBtnLabel : createBtnLabel}
        isRTL={isRTL}
        footer={
            <>
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleSaveInvoice} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-bold">
                    {isRTL ? 'حفظ' : 'Save'}
                </button>
            </>
        }
      >
         <div className="space-y-6 py-2">
            {/* Row 1: Contact (Customer/Supplier) and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{contactLabel}</label>
                    <select
                        value={newInvoiceData.contactId}
                        onChange={e => setNewInvoiceData({ ...newInvoiceData, contactId: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    >
                        <option value="">{selectContactLabel}</option>
                        {availableContacts.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-1">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'التاريخ' : 'Date'}</label>
                    <input 
                        type="date" 
                        value={newInvoiceData.date}
                        onChange={e => setNewInvoiceData({ ...newInvoiceData, date: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
                    <input 
                        type="date" 
                        value={newInvoiceData.dueDate}
                        onChange={e => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'حالة الفاتورة' : 'Invoice Status'}</label>
                    <select
                        value={newInvoiceData.status}
                        onChange={e => setNewInvoiceData({ ...newInvoiceData, status: e.target.value as any })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                    >
                        <option value="paid">{isRTL ? 'مدفوع' : 'Paid'}</option>
                        <option value="credit">{isRTL ? 'آجل' : 'Credit'}</option>
                        <option value="pending">{isRTL ? 'معلق' : 'Pending'}</option>
                    </select>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{isRTL ? 'المنتجات' : 'Products'}</h4>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'المنتج' : 'Product'}</label>
                         <select 
                            value={newInvoiceData.currentLineItem.productId}
                            onChange={e => {
                                const prod = products.find(p => p.id === e.target.value);
                                setNewInvoiceData({
                                    ...newInvoiceData,
                                    currentLineItem: {
                                        ...newInvoiceData.currentLineItem,
                                        productId: e.target.value,
                                        price: prod ? (type === 'sale' ? prod.priceSell : prod.priceBuy) : 0
                                    }
                                })
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-black focus:border-black"
                        >
                            <option value="">{isRTL ? 'اختر منتج' : 'Select Product'}</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-24">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الكمية' : 'Qty'}</label>
                        <input 
                            type="number" 
                            value={newInvoiceData.currentLineItem.quantity}
                            onChange={e => setNewInvoiceData({ ...newInvoiceData, currentLineItem: { ...newInvoiceData.currentLineItem, quantity: Number(e.target.value) }})}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-sm focus:ring-black focus:border-black"
                        />
                    </div>
                     <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{priceLabel}</label>
                        <input 
                            type="number" 
                            value={newInvoiceData.currentLineItem.price}
                            onChange={e => setNewInvoiceData({ ...newInvoiceData, currentLineItem: { ...newInvoiceData.currentLineItem, price: Number(e.target.value) }})}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-sm focus:ring-black focus:border-black"
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'الخصم' : 'Discount'}</label>
                        <input 
                            type="number" 
                            value={newInvoiceData.currentLineItem.discount}
                            onChange={e => setNewInvoiceData({ ...newInvoiceData, currentLineItem: { ...newInvoiceData.currentLineItem, discount: Number(e.target.value) }})}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-sm focus:ring-black focus:border-black"
                        />
                    </div>
                    <button 
                        onClick={handleAddLineItem}
                        className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors mb-0.5"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                
                {newInvoiceData.items.length > 0 && (
                    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500">
                                <tr>
                                    <th className="px-3 py-2">{isRTL ? 'المنتج' : 'Product'}</th>
                                    <th className="px-3 py-2">{isRTL ? 'الكمية' : 'Qty'}</th>
                                    <th className="px-3 py-2">{isRTL ? 'السعر' : 'Price'}</th>
                                    <th className="px-3 py-2">{isRTL ? 'الإجمالي' : 'Total'}</th>
                                    <th className="px-3 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {newInvoiceData.items.map((item, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td className="px-3 py-2">{item.productName}</td>
                                            <td className="px-3 py-2">{item.quantity}</td>
                                            <td className="px-3 py-2">{item.price}</td>
                                            <td className="px-3 py-2">{(item.quantity * item.price) - item.discount}</td>
                                            <td className="px-3 py-2 text-center">
                                                <button 
                                                    onClick={() => {
                                                        const updatedItems = [...newInvoiceData.items];
                                                        updatedItems.splice(idx, 1);
                                                        setNewInvoiceData({...newInvoiceData, items: updatedItems});
                                                    }}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'الضريبة' : 'Tax'}</label>
                <input 
                    type="number" 
                    value={newInvoiceData.tax}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, tax: Number(e.target.value) })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'ملاحظات' : 'Notes'}</label>
                <textarea 
                    rows={3}
                    value={newInvoiceData.notes}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, notes: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-black focus:border-black"
                />
            </div>

        </div>
      </Modal>
    </div>
  );
};

export default Invoices;
