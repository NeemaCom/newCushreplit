import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: number;
  type: string;
  amount: string;
  status: string;
  description: string;
  createdAt: string;
  fromCurrency?: string;
  toCurrency?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions: initialTransactions }: TransactionListProps) {
  const { data: transactions = initialTransactions } = useQuery({
    queryKey: ["/api/transactions"],
    initialData: initialTransactions,
  });

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') {
      return <Clock className="text-yellow-600 h-4 w-4" />;
    }
    
    switch (type) {
      case 'transfer':
        return <ArrowUp className="text-emerald-600 h-4 w-4" />;
      case 'deposit':
        return <ArrowDown className="text-blue-600 h-4 w-4" />;
      default:
        return <ArrowUp className="text-gray-600 h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'bg-emerald-100';
      case 'deposit':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAmount = (amount: string, type: string) => {
    const num = parseFloat(amount);
    const sign = type === 'transfer' ? '-' : '+';
    return `${sign}₦${num.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Recent Transactions
          </CardTitle>
          <a href="#transactions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Your transaction history will appear here</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type, transaction.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || `${transaction.type} transaction`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.createdAt), 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatAmount(transaction.amount, transaction.type)}
                  </p>
                  <p className={`text-sm capitalize ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
