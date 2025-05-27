import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  TrendingUp, 
  Wallet,
  CreditCard,
  Building,
  Globe,
  Star,
  Target
} from "lucide-react";
import EducationalPayments from "@/components/educational-payments";
import CreditBuilder from "@/components/credit-builder";

export default function FinancialServices() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cush-gray-25 to-cush-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cush-gray-900 mb-4">Financial Services</h1>
          <p className="text-lg text-cush-gray-600">
            Comprehensive financial solutions for international students and immigrants
          </p>
        </div>

        {/* Service Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-modern text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-cush-gray-900 mb-2">Tuition Payments</h3>
              <p className="text-sm text-cush-gray-600">Secure university fee payments</p>
              <Badge className="bg-blue-100 text-blue-800 text-xs mt-2">Available</Badge>
            </CardContent>
          </Card>

          <Card className="card-modern text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-cush-gray-900 mb-2">SEVIS Fees</h3>
              <p className="text-sm text-cush-gray-600">Student visa program fees</p>
              <Badge className="bg-green-100 text-green-800 text-xs mt-2">Available</Badge>
            </CardContent>
          </Card>

          <Card className="card-modern text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-cush-gray-900 mb-2">WES Evaluation</h3>
              <p className="text-sm text-cush-gray-600">Credential evaluation services</p>
              <Badge className="bg-purple-100 text-purple-800 text-xs mt-2">Available</Badge>
            </CardContent>
          </Card>

          <Card className="card-modern text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-cush-gray-900 mb-2">Credit Builder</h3>
              <p className="text-sm text-cush-gray-600">Build credit history</p>
              <Badge className="bg-orange-100 text-orange-800 text-xs mt-2">New</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="educational" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="educational" className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Educational Payments</span>
            </TabsTrigger>
            <TabsTrigger value="credit" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Credit Builder</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="educational">
            <EducationalPayments />
          </TabsContent>

          <TabsContent value="credit">
            <CreditBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}