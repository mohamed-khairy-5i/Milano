
import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  BookOpen, 
  Scale, 
  TrendingUp, 
  FileText, 
  ListTree,
  ArrowRight,
  Calendar,
  Search,
  Filter,
  Download,
  Trash2,
  Printer,
  Edit
} from 'lucide-react';
import { useData } from '../DataContext';
import { Account } from '../types';
import Modal from './Modal';

interface AccountsProps {
  isRTL: boolean;
}

type AccountView = 'menu' | 'treasury' | 'opening-balance' | 'ledger' | 'final-accounts' | 'chart-of-accounts';

const Accounts: React.FC<AccountsProps> = ({ isRTL }) => {
  const { accounts, invoices, expenses, bonds, currency, updateAccount, addAccount, deleteAccount } = useData();
  const [currentView, setCurrentView] = useState<AccountView>('menu');
  
  // State for Sub-views
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Partial<Account>>({});

  // Currency Label
  const currencyLabels: Record<string, string> = {
      'YER': isRTL ? 'ريال يمني' : 'YER',
      'SAR': isRTL ? 'ريال سعودي' : 'SAR',
      'USD': isRTL ? 'دولار' : 'USD',
  };
  const currencyLabel = currencyLabels[currency];

  // --- LEDGER LOGIC ---
  const ledgerEntries = useMemo(() => {
    const entries: { 
        id: string, 
        date: string, 
        type: string, 
        ref: string, 
        desc: string, 
        debitAccount: string, 
        creditAccount: string, 
        amount: number 
    }[] = [];

    // 1. Opening Balances
    accounts.forEach(acc => {
        if (acc.openingBalance > 0) {
            entries.push({
                id: `OPEN-${acc.id}`,
                date: '2024-01-01', // Assuming start of year
                type: 'opening',
                ref: 'OPENING',
                desc: isRTL ? 'رصيد افتتاحي' : 'Opening Balance',
                debitAccount: acc.type === 'asset' || acc.type === 'expense' ? acc.id : '',
                creditAccount: acc.type === 'liability' || acc.type === 'equity' || acc.type === 'revenue' ? acc.id : '',
                amount: acc.openingBalance
            });
        }
    });

    // 2. Invoices
    invoices.filter(i => i.status !== 'cancelled').forEach(inv => {
        if (inv.type === 'sale') {
            // Dr Customer (1100), Cr Sales (4000)
            entries.push({
                id: `INV-${inv.id}`,
                date: inv.date,
                type: 'sale',
                ref: inv.number,
                desc: `${isRTL ? 'فاتورة مبيعات' : 'Sale Invoice'} - ${inv.contactName}`,
                debitAccount: '1100', // AR
                creditAccount: '4000', // Sales
                amount: inv.total
            });
        } else {
            // Dr Purchases (5000), Cr Supplier (2000)
            entries.push({
                id: `PUR-${inv.id}`,
                date: inv.date,
                type: 'purchase',
                ref: inv.number,
                desc: `${isRTL ? 'فاتورة مشتريات' : 'Purchase Invoice'} - ${inv.contactName}`,
                debitAccount: '5000', // Purchases
                creditAccount: '2000', // AP
                amount: inv.total
            });
        }
    });

    // 3. Bonds (Receipts & Payments)
    bonds.forEach(bond => {
        const cashAccount = bond.paymentMethod === 'bank' ? '1002' : '1001';
        if (bond.type === 'receipt') {
            // Dr Cash/Bank, Cr Customer (1100)
            entries.push({
                id: `BOND-${bond.id}`,
                date: bond.date,
                type: 'receipt',
                ref: bond.number,
                desc: `${isRTL ? 'سند قبض من' : 'Receipt from'} ${bond.entityName}`,
                debitAccount: cashAccount,
                creditAccount: '1100', // AR
                amount: bond.amount
            });
        } else {
            // Dr Supplier (2000), Cr Cash/Bank
            entries.push({
                id: `BOND-${bond.id}`,
                date: bond.date,
                type: 'payment',
                ref: bond.number,
                desc: `${isRTL ? 'سند صرف لـ' : 'Payment to'} ${bond.entityName}`,
                debitAccount: '2000', // AP
                creditAccount: cashAccount,
                amount: bond.amount
            });
        }
    });

    // 4. Expenses
    expenses.forEach(exp => {
        // Dr General Expenses (5100), Cr Cash (1001)
        entries.push({
            id: `EXP-${exp.id}`,
            date: exp.date,
            type: 'expense',
            ref: '-',
            desc: `${isRTL ? 'مصروف' : 'Expense'}: ${exp.title}`,
            debitAccount: '5100',
            creditAccount: '1001',
            amount: exp.amount
        });
    });

    return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [invoices, bonds, expenses, accounts, isRTL]);

  // --- HELPER: Get Ledger for Specific Account ---
  const getAccountLedger = (accountId: string) => {
      let balance = 0;
      const account = accounts.find(a => a.id === accountId);
      
      return ledgerEntries
        .filter(e => e.debitAccount === accountId || e.creditAccount === accountId)
        .map(e => {
            const debit = e.debitAccount === accountId ? e.amount : 0;
            const credit = e.creditAccount === accountId ? e.amount : 0;
            balance += (debit - credit);
            return { ...e, debit, credit, balance };
        });
  };

  // --- HELPER: Get Trial Balance ---
  const getTrialBalance = () => {
      return accounts.map(acc => {
          const ledger = getAccountLedger(acc.id);
          const totalDebit = ledger.reduce((sum, item) => sum + item.debit, 0);
          const totalCredit = ledger.reduce((sum, item) => sum + item.credit, 0);
          const netBalance = totalDebit - totalCredit;
          return { ...acc, totalDebit, totalCredit, netBalance };
      });
  };

  // --- ACTIONS ---
  const handleDeleteAccount = (acc: Account, e: React.MouseEvent) => {
      e.stopPropagation();
      if (acc.systemAccount) {
          alert(isRTL ? 'لا يمكن حذف هذا الحساب لأنه حساب نظام أساسي' : 'Cannot delete this system account');
          return;
      }
      if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا الحساب؟' : 'Are you sure you want to delete this account?')) {
          deleteAccount(acc.id);
      }
  };

  const handlePrintLedger = (accountId: string, e?: React.MouseEvent) => {
      if(e) e.stopPropagation();
      const account = accounts.find(a => a.id === accountId);
      if (!account) return;

      const transactions = getAccountLedger(accountId);
      const printWindow = window.open('', '_blank', 'width=900,height=800');
      if (!printWindow) return;

      const direction = isRTL ? 'rtl' : 'ltr';
      const textAlign = isRTL ? 'right' : 'left';

      const htmlContent = `
        <!DOCTYPE html>
        <html dir="${direction}">
        <head>
            <title>${isRTL ? 'كشف حساب' : 'Account Statement'} - ${account.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Cairo', sans-serif; background: white; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .info { margin-bottom: 20px; display: flex; justify-content: space-between; }
                table { width: 100%; border-collapse: collapse; font-size: 14px; }
                th { background: #f3f4f6; padding: 10px; text-align: ${textAlign}; border-bottom: 2px solid #ccc; }
                td { padding: 8px; border-bottom: 1px solid #eee; }
                .totals { margin-top: 20px; font-weight: bold; text-align: ${isRTL ? 'left' : 'right'}; }
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>${isRTL ? 'كشف حساب (دفتر الأستاذ)' : 'General Ledger Statement'}</h2>
                <h3>${account.code} - ${account.name}</h3>
            </div>
            <div class="info">
                <div>${isRTL ? 'تاريخ الطباعة: ' : 'Print Date: '} ${new Date().toLocaleDateString()}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>${isRTL ? 'التاريخ' : 'Date'}</th>
                        <th>${isRTL ? 'المرجع' : 'Ref'}</th>
                        <th>${isRTL ? 'البيان' : 'Description'}</th>
                        <th>${isRTL ? 'مدين' : 'Debit'}</th>
                        <th>${isRTL ? 'دائن' : 'Credit'}</th>
                        <th>${isRTL ? 'الرصيد' : 'Balance'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr>
                            <td>${t.date}</td>
                            <td>${t.ref}</td>
                            <td>${t.desc}</td>
                            <td>${t.debit ? t.debit.toLocaleString() : '-'}</td>
                            <td>${t.credit ? t.credit.toLocaleString() : '-'}</td>
                            <td>${t.balance.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="totals">
                ${isRTL ? 'الرصيد النهائي: ' : 'Closing Balance: '} ${(transactions[transactions.length - 1]?.balance || 0).toLocaleString()} ${currencyLabel}
            </div>
            <script>window.print();</script>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
  };

  const handlePrintChart = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) return;
    
    const direction = isRTL ? 'rtl' : 'ltr';
    const textAlign = isRTL ? 'right' : 'left';

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
          <title>${isRTL ? 'دليل الحسابات' : 'Chart of Accounts'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Cairo', sans-serif; background: white; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; font-size: 14px; }
              th { background: #f3f4f6; padding: 10px; text-align: ${textAlign}; border-bottom: 2px solid #ccc; }
              td { padding: 8px; border-bottom: 1px solid #eee; }
              @media print { button { display: none; } }
          </style>
      </head>
      <body>
          <div class="header">
              <h2>${isRTL ? 'دليل الحسابات' : 'Chart of Accounts'}</h2>
              <div>${isRTL ? 'ميلانو ستور' : 'Milano Store'}</div>
          </div>
          <table>
              <thead>
                  <tr>
                      <th>${isRTL ? 'الكود' : 'Code'}</th>
                      <th>${isRTL ? 'اسم الحساب' : 'Account Name'}</th>
                      <th>${isRTL ? 'النوع' : 'Type'}</th>
                  </tr>
              </thead>
              <tbody>
                  ${accounts.sort((a,b) => a.code.localeCompare(b.code)).map(acc => `
                      <tr>
                          <td>${acc.code}</td>
                          <td>${acc.name}</td>
                          <td>${acc.type.toUpperCase()}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>
          <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- RENDERERS ---

  const renderMenu = () => {
      const cards = [
        { id: 'chart-of-accounts', title: isRTL ? 'دليل الحسابات' : 'Chart of Accounts', icon: ListTree, color: 'bg-slate-600' },
        { id: 'opening-balance', title: isRTL ? 'أرصدة أول المدة' : 'Opening Balances', icon: Scale, color: 'bg-emerald-600' },
        { id: 'ledger', title: isRTL ? 'حساب الأستاذ' : 'General Ledger', icon: BookOpen, color: 'bg-blue-600' },
        { id: 'treasury', title: isRTL ? 'الخزينة والبنوك' : 'Treasury & Bank', icon: Landmark, color: 'bg-indigo-600' },
        { id: 'final-accounts', title: isRTL ? 'الحسابات الختامية' : 'Final Accounts', icon: TrendingUp, color: 'bg-violet-600' },
      ];

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto pt-8">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <button 
                        key={card.id}
                        onClick={() => setCurrentView(card.id as AccountView)}
                        className={`${card.color} text-white p-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group text-start relative overflow-hidden h-40 flex flex-col justify-center`}
                    >
                        <div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                            <Icon size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                             <Icon size={32} className="mb-3" />
                            <h3 className="text-xl font-bold">{card.title}</h3>
                        </div>
                    </button>
                );
            })}
        </div>
      );
  };

  const renderChartOfAccounts = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{isRTL ? 'دليل الحسابات' : 'Chart of Accounts'}</h2>
              <div className="flex gap-2">
                  <button 
                    onClick={handlePrintChart}
                    className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-bold flex items-center gap-2"
                  >
                      <Printer size={18} />
                      {isRTL ? 'طباعة' : 'Print'}
                  </button>
                  <button 
                    onClick={() => { setEditingAccount({}); setIsModalOpen(true); }}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-bold"
                  >
                      {isRTL ? 'إضافة حساب' : 'Add Account'}
                  </button>
              </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-sm text-left rtl:text-right">
                  <thead className="bg-gray-50 dark:bg-gray-700 font-bold">
                      <tr>
                          <th className="px-6 py-3">{isRTL ? 'الكود' : 'Code'}</th>
                          <th className="px-6 py-3">{isRTL ? 'اسم الحساب' : 'Account Name'}</th>
                          <th className="px-6 py-3">{isRTL ? 'النوع' : 'Type'}</th>
                          <th className="px-6 py-3 text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {accounts.sort((a,b) => a.code.localeCompare(b.code)).map(acc => (
                          <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-3 font-mono">{acc.code}</td>
                              <td className="px-6 py-3 font-medium">{acc.name}</td>
                              <td className="px-6 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold
                                    ${acc.type === 'asset' ? 'bg-green-100 text-green-800' : 
                                      acc.type === 'liability' ? 'bg-red-100 text-red-800' :
                                      acc.type === 'equity' ? 'bg-blue-100 text-blue-800' :
                                      acc.type === 'revenue' ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'
                                    }`}>
                                      {acc.type.toUpperCase()}
                                  </span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setEditingAccount(acc); setIsModalOpen(true); }}
                                        className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600"
                                        title={isRTL ? 'تعديل' : 'Edit'}
                                        type="button"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => handlePrintLedger(acc.id, e)}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                                        title={isRTL ? 'طباعة كشف حساب' : 'Print Ledger'}
                                        type="button"
                                    >
                                        <Printer size={16} />
                                    </button>
                                    {!acc.systemAccount && (
                                        <button 
                                            onClick={(e) => handleDeleteAccount(acc, e)}
                                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                                            title={isRTL ? 'حذف' : 'Delete'}
                                            type="button"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderOpeningBalances = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{isRTL ? 'أرصدة أول المدة' : 'Opening Balances'}</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-sm text-left rtl:text-right">
                  <thead className="bg-gray-50 dark:bg-gray-700 font-bold">
                      <tr>
                          <th className="px-6 py-3">{isRTL ? 'الكود' : 'Code'}</th>
                          <th className="px-6 py-3">{isRTL ? 'اسم الحساب' : 'Account Name'}</th>
                          <th className="px-6 py-3 w-48">{isRTL ? 'الرصيد الافتتاحي' : 'Opening Balance'}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {accounts.map(acc => (
                          <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-3 font-mono">{acc.code}</td>
                              <td className="px-6 py-3 font-medium">{acc.name}</td>
                              <td className="px-6 py-3">
                                  <input 
                                    type="number" 
                                    value={acc.openingBalance}
                                    onChange={(e) => updateAccount({...acc, openingBalance: Number(e.target.value)})}
                                    className="w-full p-2 border border-gray-300 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                  />
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          <p className="text-sm text-gray-500 text-center">
              {isRTL ? '* يتم حفظ التغييرات تلقائياً' : '* Changes are saved automatically'}
          </p>
      </div>
  );

  const renderLedger = (preSelectedAccount?: string) => {
      const accountId = preSelectedAccount || selectedAccountId || accounts[0]?.id;
      const transactions = getAccountLedger(accountId);
      
      return (
          <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                  <div className="w-full md:w-1/3">
                      <label className="block text-sm font-medium mb-1">{isRTL ? 'الحساب' : 'Account'}</label>
                      <select 
                        value={accountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={!!preSelectedAccount}
                      >
                          {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                          ))}
                      </select>
                  </div>
                  
                  <div className="flex items-center gap-4">
                        {/* Print Ledger Button */}
                        <button 
                            onClick={(e) => handlePrintLedger(accountId, e)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
                        >
                            <Printer size={18} />
                            <span className="font-bold text-sm">{isRTL ? 'طباعة الكشف' : 'Print Statement'}</span>
                        </button>

                      {/* Summary for selected account */}
                      <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                          <div>
                              <span className="text-xs text-gray-500 block">{isRTL ? 'الرصيد الحالي' : 'Current Balance'}</span>
                              <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                  {(transactions[transactions.length - 1]?.balance || 0).toLocaleString()} {currencyLabel}
                              </span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <table className="w-full text-sm text-left rtl:text-right">
                      <thead className="bg-gray-50 dark:bg-gray-700 font-bold text-gray-700 dark:text-gray-300">
                          <tr>
                              <th className="px-4 py-3">{isRTL ? 'التاريخ' : 'Date'}</th>
                              <th className="px-4 py-3">{isRTL ? 'المرجع' : 'Ref'}</th>
                              <th className="px-4 py-3">{isRTL ? 'البيان' : 'Description'}</th>
                              <th className="px-4 py-3 text-end">{isRTL ? 'مدين' : 'Debit'}</th>
                              <th className="px-4 py-3 text-end">{isRTL ? 'دائن' : 'Credit'}</th>
                              <th className="px-4 py-3 text-end">{isRTL ? 'الرصيد' : 'Balance'}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {transactions.map((t, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-4 py-3 whitespace-nowrap">{t.date}</td>
                                  <td className="px-4 py-3 text-gray-500">{t.ref}</td>
                                  <td className="px-4 py-3">{t.desc}</td>
                                  <td className="px-4 py-3 text-end font-mono text-gray-600 dark:text-gray-300">
                                      {t.debit ? t.debit.toLocaleString() : '-'}
                                  </td>
                                  <td className="px-4 py-3 text-end font-mono text-gray-600 dark:text-gray-300">
                                      {t.credit ? t.credit.toLocaleString() : '-'}
                                  </td>
                                  <td className="px-4 py-3 text-end font-mono font-bold text-blue-600">
                                      {t.balance.toLocaleString()}
                                  </td>
                              </tr>
                          ))}
                          {transactions.length === 0 && (
                              <tr>
                                  <td colSpan={6} className="p-8 text-center text-gray-400">
                                      {isRTL ? 'لا توجد حركات' : 'No transactions'}
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  const renderTreasury = () => (
      <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cash Box */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {isRTL ? 'الصندوق (النقدية)' : 'Cash Box'}
                  </h3>
                  {renderLedger('1001')}
              </div>
              
              {/* Bank */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                   <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {isRTL ? 'البنك' : 'Bank'}
                  </h3>
                  {renderLedger('1002')}
              </div>
          </div>
      </div>
  );

  const renderFinalAccounts = () => {
      const tb = getTrialBalance();
      
      // Calculate Income Statement
      const revenue = tb.filter(a => a.type === 'revenue').reduce((s, a) => s + Math.abs(a.netBalance), 0);
      const expense = tb.filter(a => a.type === 'expense').reduce((s, a) => s + Math.abs(a.netBalance), 0);
      const netIncome = revenue - expense;

      return (
          <div className="space-y-8 animate-fade-in">
              
              {/* Income Statement Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800 text-center">
                       <h4 className="text-sm text-green-700 dark:text-green-300 font-bold mb-2">{isRTL ? 'الإيرادات' : 'Total Revenue'}</h4>
                       <p className="text-2xl font-bold text-green-800 dark:text-green-100">{revenue.toLocaleString()} {currencyLabel}</p>
                   </div>
                   <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800 text-center">
                       <h4 className="text-sm text-red-700 dark:text-red-300 font-bold mb-2">{isRTL ? 'المصروفات' : 'Total Expenses'}</h4>
                       <p className="text-2xl font-bold text-red-800 dark:text-red-100">{expense.toLocaleString()} {currencyLabel}</p>
                   </div>
                   <div className={`${netIncome >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800'} p-6 rounded-xl border text-center`}>
                       <h4 className="text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{isRTL ? 'صافي الربح/الخسارة' : 'Net Profit/Loss'}</h4>
                       <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                           {netIncome.toLocaleString()} {currencyLabel}
                       </p>
                   </div>
              </div>

              {/* Trial Balance Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-lg">{isRTL ? 'ميزان المراجعة' : 'Trial Balance'}</h3>
                  </div>
                  <table className="w-full text-sm text-left rtl:text-right">
                      <thead className="bg-gray-50 dark:bg-gray-700 font-bold">
                          <tr>
                              <th className="px-6 py-3">{isRTL ? 'الحساب' : 'Account'}</th>
                              <th className="px-6 py-3 text-end">{isRTL ? 'إجمالي مدين' : 'Total Debit'}</th>
                              <th className="px-6 py-3 text-end">{isRTL ? 'إجمالي دائن' : 'Total Credit'}</th>
                              <th className="px-6 py-3 text-end">{isRTL ? 'صافي الرصيد' : 'Net Balance'}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {tb.filter(a => a.totalDebit > 0 || a.totalCredit > 0).map(acc => (
                              <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-6 py-3 font-medium">
                                      {acc.code} - {acc.name}
                                  </td>
                                  <td className="px-6 py-3 text-end font-mono text-gray-600 dark:text-gray-300">{acc.totalDebit.toLocaleString()}</td>
                                  <td className="px-6 py-3 text-end font-mono text-gray-600 dark:text-gray-300">{acc.totalCredit.toLocaleString()}</td>
                                  <td className={`px-6 py-3 text-end font-mono font-bold ${acc.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                      {acc.netBalance.toLocaleString()}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-900/50 font-bold border-t border-gray-200 dark:border-gray-700">
                          <tr>
                              <td className="px-6 py-3">{isRTL ? 'الإجمالي' : 'Total'}</td>
                              <td className="px-6 py-3 text-end">{tb.reduce((s, a) => s + a.totalDebit, 0).toLocaleString()}</td>
                              <td className="px-6 py-3 text-end">{tb.reduce((s, a) => s + a.totalCredit, 0).toLocaleString()}</td>
                              <td className="px-6 py-3"></td>
                          </tr>
                      </tfoot>
                  </table>
              </div>
          </div>
      );
  };

  // --- MAIN RENDER ---
  return (
    <div className="h-full flex flex-col">
      {/* Header with Navigation */}
      <div className="mb-6 flex items-center justify-between">
         <div className="flex items-center gap-4">
            {currentView !== 'menu' && (
                <button 
                    onClick={() => {
                        setCurrentView('menu'); 
                        setSelectedAccountId('');
                    }}
                    className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowRight size={20} className={isRTL ? '' : 'rotate-180'} />
                </button>
            )}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {isRTL ? 'إدارة الحسابات' : 'Accounts Management'}
                </h1>
                <p className="text-gray-500 text-sm">
                    {currentView === 'menu' && (isRTL ? 'النظام المحاسبي المتكامل' : 'Integrated Accounting System')}
                    {currentView === 'chart-of-accounts' && (isRTL ? 'دليل الحسابات' : 'Chart of Accounts')}
                    {currentView === 'ledger' && (isRTL ? 'دفتر الأستاذ العام' : 'General Ledger')}
                    {currentView === 'treasury' && (isRTL ? 'الخزينة والبنوك' : 'Treasury & Banks')}
                    {currentView === 'final-accounts' && (isRTL ? 'التقارير الختامية' : 'Final Reports')}
                    {currentView === 'opening-balance' && (isRTL ? 'تعديل الأرصدة الافتتاحية' : 'Edit Opening Balances')}
                </p>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-auto">
          {currentView === 'menu' && renderMenu()}
          {currentView === 'chart-of-accounts' && renderChartOfAccounts()}
          {currentView === 'opening-balance' && renderOpeningBalances()}
          {currentView === 'ledger' && renderLedger()}
          {currentView === 'treasury' && renderTreasury()}
          {currentView === 'final-accounts' && renderFinalAccounts()}
      </div>

      {/* Add/Edit Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount.id ? (isRTL ? 'تعديل حساب' : 'Edit Account') : (isRTL ? 'إضافة حساب جديد' : 'Add New Account')}
        isRTL={isRTL}
        footer={
            <>
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                    onClick={() => {
                        if(!editingAccount.code || !editingAccount.name) return;
                        
                        const cleanData = {
                            code: editingAccount.code,
                            name: editingAccount.name,
                            type: editingAccount.type || 'expense', // Default
                            openingBalance: editingAccount.openingBalance || 0, // Default
                            description: editingAccount.description || '', // Default
                            systemAccount: editingAccount.systemAccount || false // Default and sanitize undefined
                        };

                        if(editingAccount.id) {
                            updateAccount({ ...cleanData, id: editingAccount.id } as Account);
                        } else {
                            addAccount(cleanData as any);
                        }
                        setIsModalOpen(false);
                    }} 
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-bold"
                >
                    {isRTL ? 'حفظ' : 'Save'}
                </button>
            </>
        }
      >
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium mb-1">{isRTL ? 'رقم الحساب (الكود)' : 'Account Code'}</label>
                      <input 
                        type="text" 
                        value={editingAccount.code || ''}
                        onChange={e => setEditingAccount({...editingAccount, code: e.target.value})}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        disabled={!!editingAccount.systemAccount}
                      />
                  </div>
                  <div>
                       <label className="block text-sm font-medium mb-1">{isRTL ? 'اسم الحساب' : 'Account Name'}</label>
                      <input 
                        type="text" 
                        value={editingAccount.name || ''}
                        onChange={e => setEditingAccount({...editingAccount, name: e.target.value})}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">{isRTL ? 'نوع الحساب' : 'Account Type'}</label>
                  <select 
                    value={editingAccount.type || 'asset'}
                    onChange={e => setEditingAccount({...editingAccount, type: e.target.value as any})}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    disabled={!!editingAccount.id} // Disable type change for existing to prevent breaking logic
                  >
                      <option value="asset">{isRTL ? 'أصول' : 'Asset'}</option>
                      <option value="liability">{isRTL ? 'خصوم' : 'Liability'}</option>
                      <option value="equity">{isRTL ? 'حقوق ملكية' : 'Equity'}</option>
                      <option value="revenue">{isRTL ? 'إيرادات' : 'Revenue'}</option>
                      <option value="expense">{isRTL ? 'مصروفات' : 'Expense'}</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">{isRTL ? 'الوصف' : 'Description'}</label>
                  <textarea 
                    value={editingAccount.description || ''}
                    onChange={e => setEditingAccount({...editingAccount, description: e.target.value})}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    rows={3}
                  />
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default Accounts;
