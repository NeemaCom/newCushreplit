import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { 
  Shield, 
  Smartphone, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Copy,
  QrCode,
  Clock,
  UserCheck,
  Lock,
  Unlock,
  Eye,
  Settings
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";

export default function SecurityDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [mfaSetupStep, setMfaSetupStep] = useState('method');
  const [setupData, setSetupData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Fetch MFA status
  const { data: mfaStatus, isLoading: mfaLoading } = useQuery({
    queryKey: ['/api/mfa/status'],
    retry: false,
  });

  // Fetch security events (admin only)
  const { data: securityEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/security/events'],
    retry: false,
    enabled: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  });

  // MFA Setup mutation
  const setupMFA = useMutation({
    mutationFn: async (method: string) => {
      const response = await apiRequest('POST', '/api/mfa/setup', { method });
      return response.json();
    },
    onSuccess: (data) => {
      setSetupData(data);
      setMfaSetupStep('verify');
      toast({
        title: "MFA Setup Initiated",
        description: "Please scan the QR code with your authenticator app",
      });
    }
  });

  // MFA Verification mutation
  const verifyMFA = useMutation({
    mutationFn: async (verificationData: any) => {
      const response = await apiRequest('POST', '/api/mfa/verify', verificationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mfa/status'] });
      setShowMfaSetup(false);
      setMfaSetupStep('method');
      setSetupData(null);
      toast({
        title: "MFA Enabled Successfully",
        description: "Your account is now protected with two-factor authentication",
      });
    }
  });

  // MFA Disable mutation
  const disableMFA = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/mfa/disable', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mfa/status'] });
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled",
        variant: "destructive"
      });
    }
  });

  const handleMFASetup = () => {
    setupMFA.mutate('TOTP');
  };

  const handleMFAVerification = () => {
    if (!verificationCode || !setupData) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code",
        variant: "destructive"
      });
      return;
    }

    verifyMFA.mutate({
      method: 'TOTP',
      token: verificationCode,
      secret: setupData.secret
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-cush-gray-900 mb-2">Security Dashboard</h1>
              <p className="text-lg text-cush-gray-600">
                Manage your account security and access controls
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={mfaStatus?.mfaEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {mfaStatus?.mfaEnabled ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  MFA Enabled
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  MFA Disabled
                </>
              )}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="mfa" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mfa">Multi-Factor Auth</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="events">Security Events</TabsTrigger>
          </TabsList>

          <TabsContent value="mfa" className="space-y-6">
            {/* MFA Status Card */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-blue-500" />
                  Two-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mfaLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {mfaStatus?.mfaEnabled ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                        )}
                        <div>
                          <h3 className="font-semibold text-cush-gray-900">
                            {mfaStatus?.mfaEnabled ? 'MFA is Active' : 'MFA is Disabled'}
                          </h3>
                          <p className="text-sm text-cush-gray-600">
                            {mfaStatus?.mfaEnabled 
                              ? 'Your account is protected with two-factor authentication' 
                              : 'Enable MFA to secure your account with an extra layer of protection'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {mfaStatus?.mfaEnabled ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => setShowBackupCodes(true)}
                            >
                              <Key className="w-4 h-4 mr-2" />
                              View Backup Codes
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => disableMFA.mutate()}
                              disabled={disableMFA.isPending}
                            >
                              <Unlock className="w-4 h-4 mr-2" />
                              Disable MFA
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => setShowMfaSetup(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Enable MFA
                          </Button>
                        )}
                      </div>
                    </div>

                    {mfaStatus?.mfaEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-green-200">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <Smartphone className="w-8 h-8 text-green-500" />
                              <div>
                                <h4 className="font-semibold text-cush-gray-900">Authenticator App</h4>
                                <p className="text-sm text-cush-gray-600">TOTP codes active</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <Key className="w-8 h-8 text-blue-500" />
                              <div>
                                <h4 className="font-semibold text-cush-gray-900">Backup Codes</h4>
                                <p className="text-sm text-cush-gray-600">
                                  {mfaStatus?.backupCodesCount || 0} codes available
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* MFA Setup Dialog */}
            <Dialog open={showMfaSetup} onOpenChange={setShowMfaSetup}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                  <DialogDescription>
                    Secure your account with TOTP-based authentication
                  </DialogDescription>
                </DialogHeader>
                
                {mfaSetupStep === 'method' && (
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <QrCode className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Authenticator App</h3>
                      <p className="text-sm text-cush-gray-600 mb-4">
                        Use apps like Google Authenticator, Authy, or 1Password to generate secure codes
                      </p>
                      <Button
                        onClick={handleMFASetup}
                        disabled={setupMFA.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {setupMFA.isPending ? 'Setting up...' : 'Continue with Authenticator App'}
                      </Button>
                    </div>
                  </div>
                )}

                {mfaSetupStep === 'verify' && setupData && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
                      <div className="bg-white p-4 rounded-lg border mb-4">
                        <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                          <QrCode className="w-24 h-24 text-gray-400" />
                          <div className="absolute text-xs text-center mt-16">
                            QR Code would appear here<br/>
                            {setupData.qrCodeData}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <Label className="text-sm font-medium">Manual Entry Secret:</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={setupData.secret}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(setupData.secret, 'Secret key')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="verification-code">Enter 6-digit code from your app:</Label>
                        <Input
                          id="verification-code"
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                        />
                      </div>
                      
                      <Button
                        onClick={handleMFAVerification}
                        disabled={verifyMFA.isPending || verificationCode.length !== 6}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {verifyMFA.isPending ? 'Verifying...' : 'Verify & Enable MFA'}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Backup Codes Dialog */}
            <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Backup Recovery Codes</DialogTitle>
                  <DialogDescription>
                    Save these codes in a secure location. Each code can only be used once.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Important:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Keep these codes safe and secure</li>
                          <li>Each code can only be used once</li>
                          <li>Use them when you don't have access to your authenticator app</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {setupData?.backupCodes?.map((code: string, index: number) => (
                      <div key={index} className="bg-gray-50 p-2 rounded border text-center">
                        {code}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(setupData?.backupCodes?.join('\n'), 'Backup codes')}
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Codes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-green-500" />
                  Access Control & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-cush-gray-900">Current Role</h4>
                    <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                      {user?.role || 'USER'}
                    </Badge>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-cush-gray-800">Permissions:</h5>
                      <div className="space-y-1 text-sm text-cush-gray-600">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Access wallet and transactions</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Use loan services</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Access community features</span>
                        </div>
                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-purple-500" />
                            <span>Administrative access</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-cush-gray-900">Session Security</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cush-gray-600">Last Login:</span>
                        <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cush-gray-600">Session Timeout:</span>
                        <span className="text-sm font-medium">2 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cush-gray-600">Login Attempts:</span>
                        <span className="text-sm font-medium">0 failed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') ? (
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-orange-500" />
                    Security Events Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventsLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {securityEvents.length === 0 ? (
                        <div className="text-center py-8">
                          <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-cush-gray-600">No security events recorded</p>
                        </div>
                      ) : (
                        securityEvents.slice(0, 10).map((event: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Badge className={getSeverityColor(event.severity)}>
                                  {event.severity}
                                </Badge>
                                <span className="font-medium text-cush-gray-900">
                                  {event.eventType.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-cush-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(event.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <p className="text-sm text-cush-gray-600">{event.description}</p>
                            {event.ipAddress && (
                              <p className="text-xs text-cush-gray-500">IP: {event.ipAddress}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="card-modern">
                <CardContent className="text-center py-12">
                  <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-cush-gray-900 mb-2">
                    Administrator Access Required
                  </h3>
                  <p className="text-cush-gray-600">
                    Security events monitoring is only available to administrators
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}