import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield } from "lucide-react";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  isLoading?: boolean;
}

export default function SecurityModal({ isOpen, onClose, onVerify, isLoading }: SecurityModalProps) {
  const [verificationCode, setVerificationCode] = useState("");

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      onVerify();
    }
  };

  const handleResendCode = () => {
    // In a real implementation, this would trigger a new verification code
    console.log("Resending verification code...");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Security Verification</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="text-blue-600 h-8 w-8" />
            </div>
            <p className="text-gray-600 mb-4">
              Please verify your identity to continue with this transaction.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification-code">Enter verification code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={verificationCode.length !== 6 || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendCode}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Resend
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
