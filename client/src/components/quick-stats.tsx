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
      <div className="card-modern p-6 hover:shadow-modern-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cush-gray-600 mb-1">Wallet Balance</p>
            <p className="text-3xl font-bold text-cush-gray-900">
              {ngnWallet ? formatCurrency(ngnWallet.balance, 'NGN') : '₦0'}
            </p>
            <div className="mt-3 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-cush-gray-600">Available</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet className="text-white h-7 w-7" />
          </div>
        </div>
      </div>

      {/* Active Transfers */}
      <div className="card-modern p-6 hover:shadow-modern-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cush-gray-600 mb-1">Active Transfers</p>
            <p className="text-3xl font-bold text-cush-gray-900">{activeTransfers}</p>
            <div className="mt-3">
              <span className="text-sm text-cush-gray-600">
                {activeTransfers > 0 ? `${activeTransfers} pending approval` : 'All completed'}
              </span>
            </div>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ArrowUpDown className="text-white h-7 w-7" />
          </div>
        </div>
      </div>

      {/* GBP Balance */}
      <div className="card-modern p-6 hover:shadow-modern-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cush-gray-600 mb-1">GBP Balance</p>
            <p className="text-3xl font-bold text-cush-gray-900">
              {gbpWallet ? formatCurrency(gbpWallet.balance, 'GBP') : '£0'}
            </p>
            <div className="mt-3 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-cush-gray-600">Available</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <PoundSterling className="text-white h-7 w-7" />
          </div>
        </div>
      </div>

      {/* Immigration Status */}
      <div className="card-modern p-6 hover:shadow-modern-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cush-gray-600 mb-1">Immigration Status</p>
            <p className="text-3xl font-bold text-cush-gray-900 capitalize">
              {activeCase?.status || 'No Cases'}
            </p>
            <div className="mt-3">
              <span className="text-sm text-cush-primary font-medium">
                {activeCase?.caseNumber || 'Create new case'}
              </span>
            </div>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="text-white h-7 w-7" />
          </div>
        </div>
      </div>
    </div>
  );
}
