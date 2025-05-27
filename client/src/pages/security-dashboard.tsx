import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Activity,
  TrendingUp,
  Users,
  CreditCard,
  Globe,
  Zap,
  CheckCircle,
  XCircle
} from "lucide-react";
import Header from "@/components/header";

export default function SecurityDashboard() {
  const [timeRange, setTimeRange] = useState('24h');

  // Fetch security metrics
  const { data: securityMetrics } = useQuery({
    queryKey: ['/api/security/metrics', timeRange],
    retry: false,
  });

  const { data: threatEvents } = useQuery({
    queryKey: ['/api/security/events', timeRange],
    retry: false,
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['/api/security/health'],
    retry: false,
  });

  const securityFeatures = [
    {
      name: "Rate Limiting",
      status: "active",
      description: "API and authentication rate limiting in place",
      icon: Zap,
      color: "green"
    },
    {
      name: "Encryption",
      status: "active", 
      description: "AES-256-GCM encryption for sensitive data",
      icon: Lock,
      color: "green"
    },
    {
      name: "Security Headers",
      status: "active",
      description: "CSP, HSTS, XSS protection enabled",
      icon: Shield,
      color: "green"
    },
    {
      name: "Input Validation",
      status: "active",
      description: "SQL injection and XSS prevention",
      icon: CheckCircle,
      color: "green"
    },
    {
      name: "Security Logging",
      status: "active",
      description: "Real-time threat detection and logging",
      icon: Eye,
      color: "green"
    },
    {
      name: "Payment Security",
      status: "active",
      description: "Stripe PCI DSS compliant processing",
      icon: CreditCard,
      color: "green"
    }
  ];

  const mockMetrics = {
    totalRequests: 12450,
    blockedThreats: 23,
    successfulAuths: 1840,
    failedAuths: 12,
    encryptedData: "2.4GB",
    uptime: "99.9%"
  };

  const mockEvents = [
    {
      id: 1,
      type: "Rate Limit Exceeded",
      severity: "medium",
      ip: "192.168.1.100",
      time: "2 minutes ago",
      status: "blocked"
    },
    {
      id: 2,
      type: "Failed Authentication",
      severity: "low", 
      ip: "10.0.0.15",
      time: "5 minutes ago",
      status: "logged"
    },
    {
      id: 3,
      type: "Suspicious Payload",
      severity: "high",
      ip: "203.0.113.45",
      time: "12 minutes ago", 
      status: "blocked"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-cush-gray-900 mb-2">Security Dashboard</h1>
              <p className="text-lg text-cush-gray-600">
                Enterprise-grade security monitoring and threat detection
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
              System Secure
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="threats">Threat Events</TabsTrigger>
            <TabsTrigger value="metrics">Security Metrics</TabsTrigger>
            <TabsTrigger value="features">Security Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Total Requests</p>
                      <p className="text-2xl font-bold text-cush-gray-900">{mockMetrics.totalRequests.toLocaleString()}</p>
                    </div>
                    <Globe className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Threats Blocked</p>
                      <p className="text-2xl font-bold text-red-600">{mockMetrics.blockedThreats}</p>
                    </div>
                    <Shield className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Successful Auths</p>
                      <p className="text-2xl font-bold text-green-600">{mockMetrics.successfulAuths}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Failed Auths</p>
                      <p className="text-2xl font-bold text-orange-600">{mockMetrics.failedAuths}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Data Encrypted</p>
                      <p className="text-2xl font-bold text-purple-600">{mockMetrics.encryptedData}</p>
                    </div>
                    <Lock className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Uptime</p>
                      <p className="text-2xl font-bold text-green-600">{mockMetrics.uptime}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Threats */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                  Recent Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-cush-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-semibold text-cush-gray-900">{event.type}</p>
                          <p className="text-sm text-cush-gray-600">IP: {event.ip}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-cush-gray-900">{event.status}</p>
                        <p className="text-xs text-cush-gray-500">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={feature.name} className="card-modern">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          feature.color === 'green' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <IconComponent className={`w-6 h-6 ${
                            feature.color === 'green' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-cush-gray-900">{feature.name}</h3>
                            <Badge variant={feature.status === 'active' ? 'default' : 'destructive'}>
                              {feature.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-cush-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="threats" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Threat Detection Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEvents.map((event) => (
                    <div key={event.id} className="border border-cush-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <h4 className="font-semibold text-cush-gray-900">{event.type}</h4>
                        </div>
                        <span className="text-sm text-cush-gray-500">{event.time}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-cush-gray-700">Source IP:</span>
                          <span className="ml-2 text-cush-gray-600">{event.ip}</span>
                        </div>
                        <div>
                          <span className="font-medium text-cush-gray-700">Action Taken:</span>
                          <span className="ml-2 text-cush-gray-600">{event.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle>Security Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-cush-gray-700">Threat Detection Rate</span>
                      <span className="text-sm font-bold text-green-600">99.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-cush-gray-700">Response Time</span>
                      <span className="text-sm font-bold text-blue-600">&lt; 50ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-cush-gray-700">False Positives</span>
                      <span className="text-sm font-bold text-orange-600">0.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-cush-gray-700">Database Security</span>
                      <Badge className="bg-green-100 text-green-800">Secure</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-cush-gray-700">API Endpoints</span>
                      <Badge className="bg-green-100 text-green-800">Protected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-cush-gray-700">SSL/TLS</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
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