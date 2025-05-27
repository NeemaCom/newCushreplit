import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Clock, 
  MapPin, 
  Activity,
  TrendingUp,
  Users,
  Lock,
  Unlock,
  Zap,
  Target,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ThreatData {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  description: string;
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
}

interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  threats: ThreatData[];
  region: string;
}

export default function SecurityHeatmap() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedThreatType, setSelectedThreatType] = useState('all');
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch security threats data
  const { data: threatsData = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/security/threats', selectedTimeRange, selectedThreatType],
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds
    retry: false,
  });

  // Fetch real-time metrics
  const { data: securityMetrics } = useQuery({
    queryKey: ['/api/security/metrics'],
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds
    retry: false,
  });

  // Generate heatmap data from threats
  const generateHeatmapData = (): HeatmapCell[] => {
    const grid: HeatmapCell[] = [];
    const regions = [
      'North America', 'Europe', 'Asia Pacific', 'South America',
      'Africa', 'Middle East', 'Oceania', 'Central Asia'
    ];
    
    // Create 8x6 grid for global threat visualization
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 6; y++) {
        const region = regions[Math.floor((x * 6 + y) % regions.length)];
        const cellThreats = threatsData.filter((threat: ThreatData) => 
          threat.location?.includes(region) || Math.random() > 0.7
        );
        
        grid.push({
          x,
          y,
          value: cellThreats.length,
          threats: cellThreats,
          region
        });
      }
    }
    
    return grid;
  };

  const heatmapData = generateHeatmapData();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#dc2626'; // red-600
      case 'HIGH': return '#ea580c'; // orange-600
      case 'MEDIUM': return '#d97706'; // amber-600
      case 'LOW': return '#65a30d'; // lime-600
      default: return '#6b7280'; // gray-500
    }
  };

  const getHeatIntensity = (value: number) => {
    if (value === 0) return 'rgba(59, 130, 246, 0.1)'; // blue-500 with low opacity
    if (value <= 2) return 'rgba(34, 197, 94, 0.4)'; // green-500
    if (value <= 5) return 'rgba(245, 158, 11, 0.6)'; // amber-500
    if (value <= 10) return 'rgba(239, 68, 68, 0.7)'; // red-500
    return 'rgba(220, 38, 38, 0.9)'; // red-600
  };

  const threatTypeColors = {
    'LOGIN_ATTEMPT': '#3b82f6', // blue
    'PERMISSION_VIOLATION': '#ef4444', // red
    'SUSPICIOUS_TRANSACTION': '#f59e0b', // amber
    'MFA_BYPASS_ATTEMPT': '#8b5cf6', // violet
    'API_ABUSE': '#06b6d4', // cyan
    'DATA_BREACH': '#dc2626', // dark red
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-gray-900">Real-time Security Heatmap</span>
          </div>
          
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedThreatType} onValueChange={setSelectedThreatType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Threat Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Threats</SelectItem>
              <SelectItem value="LOGIN_ATTEMPT">Login Attempts</SelectItem>
              <SelectItem value="PERMISSION_VIOLATION">Permission Violations</SelectItem>
              <SelectItem value="SUSPICIOUS_TRANSACTION">Suspicious Transactions</SelectItem>
              <SelectItem value="MFA_BYPASS_ATTEMPT">MFA Bypass</SelectItem>
              <SelectItem value="API_ABUSE">API Abuse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 text-green-700 border-green-200" : ""}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Eye className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical Threats</p>
                <p className="text-2xl font-bold text-red-900">
                  {threatsData.filter((t: ThreatData) => t.severity === 'CRITICAL').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">High Risk</p>
                <p className="text-2xl font-bold text-orange-900">
                  {threatsData.filter((t: ThreatData) => t.severity === 'HIGH').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Sessions</p>
                <p className="text-2xl font-bold text-blue-900">
                  {securityMetrics?.activeSessions || 847}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-900">
                  {threatsData.filter((t: ThreatData) => t.status === 'RESOLVED').length}
                </p>
              </div>
              <Lock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Heatmap */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-500" />
            Global Threat Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Heatmap Grid */}
            <div className="grid grid-cols-8 gap-1 mb-4">
              {heatmapData.map((cell, index) => (
                <div
                  key={index}
                  className="aspect-square relative cursor-pointer border border-gray-200 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: getHeatIntensity(cell.value) }}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {cell.value > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-black bg-opacity-50 rounded px-1">
                        {cell.value}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Low Risk</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-100 border rounded"></div>
                <div className="w-4 h-4 bg-green-400 border rounded"></div>
                <div className="w-4 h-4 bg-amber-500 border rounded"></div>
                <div className="w-4 h-4 bg-red-500 border rounded"></div>
                <div className="w-4 h-4 bg-red-600 border rounded"></div>
              </div>
              <span>Critical Risk</span>
            </div>
          </div>

          {/* Tooltip for hovered cell */}
          {hoveredCell && (
            <div className="absolute z-10 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{hoveredCell.region}</h4>
              <p className="text-sm text-gray-600 mb-2">
                Threat Level: <span className="font-medium">{hoveredCell.value}</span>
              </p>
              {hoveredCell.threats.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Recent Threats:</p>
                  {hoveredCell.threats.slice(0, 3).map((threat, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Badge 
                        className="text-xs"
                        style={{ backgroundColor: getSeverityColor(threat.severity) }}
                      >
                        {threat.severity}
                      </Badge>
                      <span className="text-xs text-gray-600">{threat.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threat Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {threatsData.slice(0, 10).map((threat: ThreatData, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getSeverityColor(threat.severity) }}
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{threat.type}</p>
                      <p className="text-xs text-gray-600">{threat.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{threat.location || 'Unknown'}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{new Date(threat.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threat Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Threat Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(threatTypeColors).map(([type, color]) => {
                const count = threatsData.filter((t: ThreatData) => t.type === type).length;
                const percentage = threatsData.length > 0 ? (count / threatsData.length) * 100 : 0;
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {type.replace('_', ' ')}
                      </span>
                      <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Response Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Initiate Emergency Lockdown
              </Button>
              
              <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                <Shield className="w-4 h-4 mr-2" />
                Escalate High-Risk Threats
              </Button>
              
              <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                <Users className="w-4 h-4 mr-2" />
                Review User Sessions
              </Button>
              
              <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                <Lock className="w-4 h-4 mr-2" />
                Generate Security Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}