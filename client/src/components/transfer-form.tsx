import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferSchema, type TransferRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SecurityModal from "./security-modal";

interface TransferFormProps {
  wallets: Array<{
    currency: string;
    balance: string;
  }>;
}

export default function TransferForm({ wallets }: TransferFormProps) {
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<TransferRequest | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<TransferRequest>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromCurrency: "NGN",
      toCurrency: "GBP",
      amount: "",
      recipient: "",
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: TransferRequest) => {
      const response = await apiRequest("POST", "/api/transfer", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      toast({
        title: "Transfer Initiated",
        description: data.message,
      });
      
      form.reset();
      setShowSecurityModal(false);
      setPendingTransfer(null);
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to process transfer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransferRequest) => {
    setPendingTransfer(data);
    setShowSecurityModal(true);
  };

  const handleSecurityVerification = () => {
    if (pendingTransfer) {
      transferMutation.mutate(pendingTransfer);
    }
  };

  const amount = form.watch("amount");
  const exchangeRate = 1850;
  const fee = 2500;
  const convertedAmount = amount ? (parseFloat(amount) / exchangeRate).toFixed(2) : "0.00";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Send Money</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Currency Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Select
                  value={form.watch("fromCurrency")}
                  onValueChange={(value) => form.setValue("fromCurrency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Select
                  value={form.watch("toCurrency")}
                  onValueChange={(value) => form.setValue("toCurrency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">GBP - British Pounds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (NGN)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    {...form.register("amount")}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₦
                  </span>
                </div>
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Recipient gets</Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={`£${convertedAmount}`}
                    readOnly
                    className="pl-8 bg-gray-50"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    £
                  </span>
                </div>
              </div>
            </div>

            {/* Exchange Rate Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Exchange Rate:</span>
                <span className="font-medium">1 GBP = {exchangeRate.toLocaleString()} NGN</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Transfer Fee:</span>
                <span className="font-medium">₦{fee.toLocaleString()}</span>
              </div>
            </div>

            {/* Recipient Input */}
            <div className="space-y-2">
              <Label>Recipient Details</Label>
              <Input
                type="email"
                placeholder="Recipient email or account"
                {...form.register("recipient")}
              />
              {form.formState.errors.recipient && (
                <p className="text-sm text-red-600">{form.formState.errors.recipient.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={transferMutation.isPending}
            >
              {transferMutation.isPending ? "Processing..." : "Continue Transfer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SecurityModal
        isOpen={showSecurityModal}
        onClose={() => {
          setShowSecurityModal(false);
          setPendingTransfer(null);
        }}
        onVerify={handleSecurityVerification}
        isLoading={transferMutation.isPending}
      />
    </>
  );
}
