import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  CreditCard, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Pause, 
  Play,
  Shield,
  Wallet,
  RefreshCcw,
  Globe,
  TrendingUp,
  Settings,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletData {
  id: number;
  currency: string;
  balance: string;
  isActive: boolean;
}

interface VirtualCardData {
  id: number;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolderName: string;
  status: string;
  spendingLimit: string;
  currency: string;
  walletId: number;
}

const currencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' }
];

export default function MultiCurrencyWallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCardDetails, setShowCardDetails] = useState<{ [key: number]: boolean }>({});
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  // Fetch user wallets
  const { data: wallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ['/api/wallets'],
    enabled: !!user,
  });

  // Fetch virtual cards
  const { data: virtualCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['/api/virtual-cards'],
    enabled: !!user,
  });

  // Create new wallet mutation
  const createWalletMutation = useMutation({
    mutationFn: async (currency: string) => {
      const response = await apiRequest("POST", "/api/wallets", { currency });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      toast({
        title: "Wallet Created",
        description: "New wallet successfully created!",
      });
    },
  });

  // Create virtual card mutation
  const createCardMutation = useMutation({
    mutationFn: async (walletId: number) => {
      const response = await apiRequest("POST", "/api/virtual-cards", { walletId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/virtual-cards'] });
      setIsCreatingCard(false);
      toast({
        title: "Virtual Card Created",
        description: "Your new virtual card is ready to use!",
      });
    },
  });

  // Suspend/activate card mutation
  const toggleCardMutation = useMutation({
    mutationFn: async ({ cardId, action }: { cardId: number; action: 'suspend' | 'activate' }) => {
      const response = await apiRequest("PATCH", `/api/virtual-cards/${cardId}/${action}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/virtual-cards'] });
      toast({
        title: "Card Updated",
        description: "Card status successfully updated!",
      });
    },
  });

  const getCurrencyInfo = (code: string) => {
    return currencies.find(c => c.code === code) || currencies[0];
  };

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  };

  const maskCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(.{4})(.{4})(.{4})(.{4})/, '**** **** **** $4');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard!`,
    });
  };

  if (walletsLoading || cardsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-cush-gray-900">Multi-Currency Wallets</h2>
          <p className="text-cush-gray-600 mt-2">Manage your global finances with ease</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-cush-primary hover:bg-cush-primary-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Currency
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Currency Wallet</DialogTitle>
              <DialogDescription>
                Choose a currency to add to your wallet collection
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {currencies.map((currency) => (
                <Button
                  key={currency.code}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                  onClick={() => createWalletMutation.mutate(currency.code)}
                  disabled={createWalletMutation.isPending || wallets.some((w: WalletData) => w.currency === currency.code)}
                >
                  <div className="text-2xl">{currency.flag}</div>
                  <div className="font-semibold">{currency.code}</div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="wallets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallets" className="flex items-center space-x-2">
            <Wallet className="w-4 h-4" />
            <span>Currency Wallets</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Virtual Cards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-6">
          {wallets.length === 0 ? (
            <Card className="card-modern text-center py-12">
              <CardContent>
                <Wallet className="w-16 h-16 text-cush-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-cush-gray-900 mb-2">No Wallets Yet</h3>
                <p className="text-cush-gray-600 mb-6">Add your first currency wallet to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wallets.map((wallet: WalletData) => {
                const currencyInfo = getCurrencyInfo(wallet.currency);
                return (
                  <Card key={wallet.id} className="card-modern overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-cush-primary to-cush-primary-600 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{currencyInfo.flag}</div>
                          <div>
                            <CardTitle className="text-white">{currencyInfo.name}</CardTitle>
                            <p className="text-cush-primary-100 text-sm">{currencyInfo.code}</p>
                          </div>
                        </div>
                        {wallet.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-300" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-orange-300" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-cush-gray-600 mb-1">Available Balance</p>
                          <p className="text-2xl font-bold text-cush-gray-900">
                            {currencyInfo.symbol}{parseFloat(wallet.balance).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedWallet(wallet)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Funds
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedWallet(wallet);
                              setIsCreatingCard(true);
                            }}
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            New Card
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cards" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-cush-gray-900">Virtual Cards</h3>
              <p className="text-cush-gray-600">Secure virtual cards for online payments</p>
            </div>
            {wallets.length > 0 && (
              <Dialog open={isCreatingCard} onOpenChange={setIsCreatingCard}>
                <DialogTrigger asChild>
                  <Button className="bg-cush-primary hover:bg-cush-primary-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Virtual Card</DialogTitle>
                    <DialogDescription>
                      Choose a wallet to create a new virtual card
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {wallets.map((wallet: WalletData) => {
                      const currencyInfo = getCurrencyInfo(wallet.currency);
                      return (
                        <Button
                          key={wallet.id}
                          variant="outline"
                          className="w-full h-16 flex items-center justify-between"
                          onClick={() => createCardMutation.mutate(wallet.id)}
                          disabled={createCardMutation.isPending}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{currencyInfo.flag}</div>
                            <div className="text-left">
                              <div className="font-semibold">{currencyInfo.name}</div>
                              <div className="text-sm text-cush-gray-600">
                                {currencyInfo.symbol}{parseFloat(wallet.balance).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <CreditCard className="w-5 h-5 text-cush-gray-400" />
                        </Button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {virtualCards.length === 0 ? (
            <Card className="card-modern text-center py-12">
              <CardContent>
                <CreditCard className="w-16 h-16 text-cush-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-cush-gray-900 mb-2">No Virtual Cards</h3>
                <p className="text-cush-gray-600 mb-6">Create your first virtual card for secure online payments</p>
                {wallets.length === 0 && (
                  <p className="text-sm text-cush-gray-500">You need at least one wallet to create a virtual card</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {virtualCards.map((card: VirtualCardData) => {
                const currencyInfo = getCurrencyInfo(card.currency);
                const isVisible = showCardDetails[card.id] || false;
                
                return (
                  <Card key={card.id} className="card-modern overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-gray-800 to-gray-900 text-white relative">
                      <div className="absolute top-4 right-4">
                        <Badge 
                          className={`${
                            card.status === 'active' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-orange-500 text-white'
                          }`}
                        >
                          {card.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-2xl">{currencyInfo.flag}</div>
                          <Shield className="w-6 h-6 text-white opacity-80" />
                        </div>
                        
                        <div>
                          <p className="text-lg font-mono tracking-wider">
                            {isVisible ? formatCardNumber(card.cardNumber) : maskCardNumber(card.cardNumber)}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-300">VALID THRU</p>
                            <p className="font-mono">
                              {isVisible ? `${card.expiryMonth}/${card.expiryYear}` : '**/**'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-300">CVV</p>
                            <p className="font-mono">
                              {isVisible ? card.cvv : '***'}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-300">{card.cardHolderName}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-cush-gray-600">Spending Limit</p>
                            <p className="font-semibold">
                              {currencyInfo.symbol}{parseFloat(card.spendingLimit).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCardDetails(prev => ({
                              ...prev,
                              [card.id]: !prev[card.id]
                            }))}
                          >
                            {isVisible ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        
                        {isVisible && (
                          <div className="space-y-2 p-3 bg-cush-gray-25 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-cush-gray-600">Card Number</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(card.cardNumber, 'Card number')}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-cush-gray-600">CVV</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(card.cvv, 'CVV')}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => toggleCardMutation.mutate({
                              cardId: card.id,
                              action: card.status === 'active' ? 'suspend' : 'activate'
                            })}
                            disabled={toggleCardMutation.isPending}
                          >
                            {card.status === 'active' ? (
                              <>
                                <Pause className="w-4 h-4 mr-1" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Settings
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}