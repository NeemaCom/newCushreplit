import { Wallet, ArrowUpDown, PoundSterling, FileText } from "lucide-react";

interface QuickStatsProps {
  wallets: Array<{
    currency: string;
    balance: string;
  }>;
  transactions: Array<any>;
  immigrationCases: Array<{
    caseNumber: string;
    status: string;
  }>;
}

export default function QuickStats({ wallets, transactions, immigrationCases }: QuickStatsProps) {
  const ngnWallet = wallets.find(w => w.currency === 'NGN');
  const gbpWallet = wallets.find(w => w.currency === 'GBP');
  const activeTransfers = transactions.filter(t => t.status === 'pending').length;
  const activeCase = immigrationCases[0];

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    if (currency === 'NGN') {
      return `₦${num.toLocaleString()}`;
    } else if (currency === 'GBP') {
      return `£${num.toLocaleString()}`;
    }
    return amount;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* NGN Wallet Balance */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {ngnWallet ? formatCurrency(ngnWallet.balance, 'NGN') : '₦0'}
            </p>
            <p className="text-sm text-emerald-600 mt-1">Available</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <Wallet className="text-blue-600 h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Active Transfers */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Transfers</p>
            <p className="text-2xl font-bold text-gray-900">{activeTransfers}</p>
            <p className="text-sm text-gray-500 mt-1">
              {activeTransfers > 0 ? `${activeTransfers} pending approval` : 'All completed'}
            </p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-lg">
            <ArrowUpDown className="text-emerald-600 h-6 w-6" />
          </div>
        </div>
      </div>

      {/* GBP Balance */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">GBP Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {gbpWallet ? formatCurrency(gbpWallet.balance, 'GBP') : '£0'}
            </p>
            <p className="text-sm text-emerald-600 mt-1">Available</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <PoundSterling className="text-purple-600 h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Immigration Status */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Immigration Status</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {activeCase?.status || 'No Cases'}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {activeCase?.caseNumber || 'Create new case'}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <FileText className="text-blue-600 h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
