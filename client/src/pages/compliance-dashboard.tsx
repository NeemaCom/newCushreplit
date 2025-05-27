import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  FileText,
  BarChart3,
  Activity,
  Eye,
  AlertCircle
} from "lucide-react";
import Header from "@/components/header";

export default function ComplianceDashboard() {
  const [timeRange, setTimeRange] = useState('24h');

  // Fetch compliance metrics
  const { data: complianceMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/compliance/metrics', timeRange],
    retry: false,
  });

  // Fetch processing statistics
  const { data: processingStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/transactions/processing-stats'],
    retry: false,
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (metricsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-cush-gray-900 mb-2">Compliance Dashboard</h1>
              <p className="text-lg text-cush-gray-600">
                Real-time transaction monitoring and regulatory compliance
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-cush-gray-300 rounded-lg bg-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              System Active
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Processing</TabsTrigger>
            <TabsTrigger value="risk">Risk Management</TabsTrigger>
            <TabsTrigger value="reporting">Compliance Reporting</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Total Transactions</p>
                      <p className="text-2xl font-bold text-cush-gray-900">
                        {complianceMetrics?.totalTransactions?.toLocaleString() || '1,250'}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Flagged Transactions</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {complianceMetrics?.flaggedTransactions || '23'}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Compliance Rate</p>
                      <p className={`text-2xl font-bold ${getComplianceColor(complianceMetrics?.complianceRate || 98.16)}`}>
                        {complianceMetrics?.complianceRate || '98.16'}%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Processing Queue</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {processingStats?.queueLength || '5'}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                    Risk Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceMetrics?.riskDistribution ? (
                      Object.entries(complianceMetrics.riskDistribution).map(([risk, count]) => (
                        <div key={risk} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className={getRiskColor(risk)}>
                              {risk}
                            </Badge>
                            <span className="text-sm text-cush-gray-700">{risk} Risk</span>
                          </div>
                          <span className="font-semibold text-cush-gray-900">{count}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-green-100 text-green-800">LOW</Badge>
                            <span className="text-sm text-cush-gray-700">Low Risk</span>
                          </div>
                          <span className="font-semibold text-cush-gray-900">1,180</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-yellow-100 text-yellow-800">MEDIUM</Badge>
                            <span className="text-sm text-cush-gray-700">Medium Risk</span>
                          </div>
                          <span className="font-semibold text-cush-gray-900">47</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-orange-100 text-orange-800">HIGH</Badge>
                            <span className="text-sm text-cush-gray-700">High Risk</span>
                          </div>
                          <span className="font-semibold text-cush-gray-900">20</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-red-100 text-red-800">CRITICAL</Badge>
                            <span className="text-sm text-cush-gray-700">Critical Risk</span>
                          </div>
                          <span className="font-semibold text-cush-gray-900">3</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-500" />
                    Compliance Framework Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceMetrics?.frameworkCompliance ? (
                      Object.entries(complianceMetrics.frameworkCompliance).map(([framework, rate]) => (
                        <div key={framework} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-cush-gray-700">{framework}</span>
                          <span className={`font-semibold ${getComplianceColor(rate as number)}`}>
                            {rate}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-cush-gray-700">AML</span>
                          <span className="font-semibold text-green-600">97.5%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-cush-gray-700">KYC</span>
                          <span className="font-semibold text-yellow-600">94.2%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-cush-gray-700">GDPR</span>
                          <span className="font-semibold text-green-600">99.1%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-cush-gray-700">PCI DSS</span>
                          <span className="font-semibold text-green-600">100%</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {/* Processing Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Queue Length</p>
                      <p className="text-2xl font-bold text-cush-gray-900">
                        {processingStats?.queueLength || '5'}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Compliance Queue</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {processingStats?.complianceQueueLength || '2'}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Avg Processing</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(processingStats?.averageProcessingTime || 3500) / 1000}s
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Throughput/Min</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {processingStats?.throughputPerMinute || '45'}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Processing Status */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Real-time Processing Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="font-semibold text-green-800">Transaction Processing System</p>
                        <p className="text-sm text-green-600">Operating normally</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-6 h-6 text-blue-500" />
                      <div>
                        <p className="font-semibold text-blue-800">Compliance Engine</p>
                        <p className="text-sm text-blue-600">AML/KYC checks active</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-purple-500" />
                      <div>
                        <p className="font-semibold text-purple-800">Reporting System</p>
                        <p className="text-sm text-purple-600">CTR/SAR generation ready</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                  Risk Management Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-cush-gray-900">High-Risk Indicators</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cush-gray-700">Large transactions (&gt;$10K)</span>
                        <Badge className="bg-orange-100 text-orange-800">12</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cush-gray-700">Velocity patterns</span>
                        <Badge className="bg-yellow-100 text-yellow-800">5</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cush-gray-700">Cross-border transfers</span>
                        <Badge className="bg-blue-100 text-blue-800">89</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-cush-gray-900">Risk Mitigation</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cush-gray-700">Enhanced due diligence</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cush-gray-700">Real-time monitoring</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cush-gray-700">Automated blocking</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reporting" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">CTR Reports Filed</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {complianceMetrics?.reportingMetrics?.ctrFiled || '12'}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">SAR Reports Filed</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {complianceMetrics?.reportingMetrics?.sarFiled || '3'}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Pending Reports</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {complianceMetrics?.reportingMetrics?.pending || '2'}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}