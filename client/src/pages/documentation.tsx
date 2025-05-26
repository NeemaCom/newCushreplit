import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Clock, CheckCircle, Shield, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Header from "@/components/header";

const orderSchema = z.object({
  serviceId: z.number(),
  deliveryAddress: z.string().min(10),
  phoneNumber: z.string().min(10),
  additionalNotes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function Documentation() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/documentation/services"],
  });

  const { data: userOrders = [] } = useQuery({
    queryKey: ["/api/documentation/orders"],
  });

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      deliveryAddress: "",
      phoneNumber: "",
      additionalNotes: "",
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const response = await apiRequest("POST", "/api/documentation/order", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documentation/orders"] });
      toast({
        title: "Order Placed Successfully",
        description: `Your order #${data.orderNumber} has been created. Redirecting to payment...`,
      });
      
      // Redirect to payment page
      window.location.href = data.checkoutUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const handleOrderService = (service: any) => {
    setSelectedService(service);
    form.setValue("serviceId", service.id);
    setShowOrderDialog(true);
  };

  const onSubmitOrder = (data: OrderFormData) => {
    orderMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get your essential documents processed quickly and securely with our trusted partners
          </p>
        </div>

        {/* Services Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: any) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FileText className="text-blue-600 h-6 w-6" />
                    </div>
                    <Badge variant="secondary">
                      £{parseFloat(service.price).toFixed(2)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      Processing: {service.processingTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Shield className="h-4 w-4 mr-2" />
                      Secure & Verified
                    </div>
                  </div>

                  {service.requirements && service.requirements.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Requirements:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {service.requirements.slice(0, 3).map((req: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => handleOrderService(service)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Order Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* User Orders */}
        {userOrders.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h2>
            
            <div className="space-y-4">
              {userOrders.map((order: any) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-gray-600">{order.service?.name}</p>
                        <p className="text-sm text-gray-500">
                          Ordered on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'processing' ? 'secondary' :
                            order.status === 'pending' ? 'outline' : 'destructive'
                          }
                        >
                          {order.status}
                        </Badge>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          £{parseFloat(order.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Order Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span>Order {selectedService?.name}</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmitOrder)} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">
                    £{selectedService ? parseFloat(selectedService.price).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                <Textarea
                  id="deliveryAddress"
                  placeholder="Enter your full delivery address"
                  {...form.register("deliveryAddress")}
                />
                {form.formState.errors.deliveryAddress && (
                  <p className="text-sm text-red-600">{form.formState.errors.deliveryAddress.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+44 7123 456789"
                  {...form.register("phoneNumber")}
                />
                {form.formState.errors.phoneNumber && (
                  <p className="text-sm text-red-600">{form.formState.errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any special instructions or requirements"
                  {...form.register("additionalNotes")}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={orderMutation.isPending}
              >
                {orderMutation.isPending ? "Processing..." : "Proceed to Payment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}