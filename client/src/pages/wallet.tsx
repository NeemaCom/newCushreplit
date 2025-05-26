import MultiCurrencyWallet from "@/components/multi-currency-wallet";

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cush-gray-25 to-cush-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MultiCurrencyWallet />
      </div>
    </div>
  );
}