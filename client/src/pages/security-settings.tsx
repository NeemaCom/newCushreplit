import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Smartphone, 
  Key, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Download,
  Copy,
  RotateCcw,
  Settings,
  Globe,
  Clock,
  UserCheck,
  AlertCircle,
  QrCode
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function SecuritySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [mfaStep, setMfaStep] = useState<'disabled' | 'setup' | 'verify' | 'enabled'>('disabled');
  const [totpCode, setTotpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [sessions, setSessions] = useState([]);

  // Fetch user security settings
  const { data: securitySettings, isLoading } = useQuery({
    queryKey: ['/api/security/settings'],
    retry: false,
  });

  // Fetch active sessions
  const { data: activeSessions } = useQuery({
    queryKey: ['/api/security/sessions'],
    retry: false,
  });

  // Setup MFA mutation
  const setupMfaMutation = useMutation({
    mutationFn: (method: string) => apiRequest('POST', '/api/security/mfa/setup', { method }),
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCode);
      setMfaStep('setup');
      toast({
        title: "MFA Setup Started",
        description: "Scan the QR code with your authenticator app",
      });
    },
    onError: () => {
      toast({
        title: "Setup Failed",
        description: "Could not start MFA setup. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify MFA mutation
  const verifyMfaMutation = useMutation({
    mutationFn: (code: string) => apiRequest('POST', '/api/security/mfa/verify', { code }),
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setMfaStep('enabled');
      setShowBackupCodes(true);
      queryClient.invalidateQueries({ queryKey: ['/api/security/settings'] });
      toast({
        title: "MFA Enabled Successfully",
        description: "Your account is now protected with two-factor authentication",
      });
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Disable MFA mutation
  const disableMfaMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/security/mfa/disable'),
    onSuccess: () => {
      setMfaStep('disabled');
      queryClient.invalidateQueries({ queryKey: ['/api/security/settings'] });
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled",
      });
    },
  });

  // Revoke session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiRequest('POST', '/api/security/sessions/revoke', { sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/sessions'] });
      toast({
        title: "Session Revoked",
        description: "The session has been terminated",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cush-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (securitySettings?.mfaEnabled) {
      setMfaStep('enabled');
    }
  }, [securitySettings]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Security Settings</h1>
            <p className="text-lg text-gray-600">Protect your account with advanced security</p>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Account Protected</h3>
                <p className="text-green-700">Your account security level: {securitySettings?.mfaEnabled ? 'High' : 'Medium'}</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <Shield className="w-3 h-3 mr-1" />
              {securitySettings?.mfaEnabled ? 'MFA Enabled' : 'Basic Security'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Multi-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5" />
              <span>Multi-Factor Authentication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {mfaStep === 'disabled' && (
              <>
                <div className="text-center space-y-4">
                  <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg">MFA Not Enabled</h3>
                    <p className="text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setupMfaMutation.mutate('TOTP')}
                  disabled={setupMfaMutation.isPending}
                  className="w-full"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Enable MFA
                </Button>
              </>
            )}

            {mfaStep === 'setup' && (
              <div className="space-y-4">
                <Alert>
                  <QrCode className="w-4 h-4" />
                  <AlertDescription>
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </AlertDescription>
                </Alert>
                
                <div className="text-center">
                  <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">QR Code would appear here</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totp-code">Enter the 6-digit code from your app</Label>
                  <Input
                    id="totp-code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={() => verifyMfaMutation.mutate(totpCode)}
                    disabled={totpCode.length !== 6 || verifyMfaMutation.isPending}
                    className="flex-1"
                  >
                    Verify & Enable
                  </Button>
                  <Button variant="outline" onClick={() => setMfaStep('disabled')}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {mfaStep === 'enabled' && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="font-semibold text-lg">MFA Enabled</h3>
                  <p className="text-gray-600">Your account is protected with two-factor authentication</p>
                </div>

                {showBackupCodes && backupCodes.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Save your backup codes!</strong> These codes can be used to access your account if you lose your authenticator device.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  variant="outline" 
                  onClick={() => disableMfaMutation.mutate()}
                  disabled={disableMfaMutation.isPending}
                  className="w-full"
                >
                  Disable MFA
                </Button>
              </div>
            )}

            {/* Backup Codes */}
            {showBackupCodes && backupCodes.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-sm">Backup Recovery Codes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span>{code}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(code)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={downloadBackupCodes} className="flex-1">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowBackupCodes(false)}>
                      Hide Codes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Access Control & Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5" />
              <span>Access Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Account Role</span>
                <Badge className={`${
                  user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role || 'USER'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Last Login</span>
                <span className="text-sm text-gray-600">
                  {securitySettings?.lastLoginAt 
                    ? new Date(securitySettings.lastLoginAt).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Login Attempts</span>
                <span className="text-sm text-gray-600">{securitySettings?.loginAttempts || 0}</span>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Active Sessions</h4>
                <Button size="sm" variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/security/sessions'] })}>
                  <Refresh className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              </div>

              <div className="space-y-3">
                {activeSessions?.map((session: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{session.userAgent || 'Unknown Device'}</span>
                        {session.current && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Current</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span>{session.ipAddress}</span>
                        <span>{session.location || 'Unknown Location'}</span>
                        <span>{new Date(session.lastActive).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {!session.current && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => revokeSessionMutation.mutate(session.id)}
                        disabled={revokeSessionMutation.isPending}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <p>No active sessions found</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Security Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold text-green-900">Strong Password</h4>
              <p className="text-sm text-green-700">Your password meets security requirements</p>
            </div>
            
            <div className={`p-4 border rounded-lg ${
              securitySettings?.mfaEnabled 
                ? 'border-green-200 bg-green-50' 
                : 'border-yellow-200 bg-yellow-50'
            }`}>
              {securitySettings?.mfaEnabled ? (
                <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-yellow-600 mb-2" />
              )}
              <h4 className={`font-semibold ${
                securitySettings?.mfaEnabled ? 'text-green-900' : 'text-yellow-900'
              }`}>
                Two-Factor Authentication
              </h4>
              <p className={`text-sm ${
                securitySettings?.mfaEnabled ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {securitySettings?.mfaEnabled 
                  ? 'MFA is enabled and protecting your account' 
                  : 'Enable MFA for additional security'
                }
              </p>
            </div>
            
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-blue-900">Regular Reviews</h4>
              <p className="text-sm text-blue-700">Review security settings monthly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}