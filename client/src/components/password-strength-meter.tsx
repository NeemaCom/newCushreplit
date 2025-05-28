import { useState, useEffect } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange?: (strength: number) => void;
}

export default function PasswordStrengthMeter({ password, onStrengthChange }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);

  useEffect(() => {
    const calculateStrength = () => {
      let score = 0;
      const suggestions: string[] = [];

      if (password.length === 0) {
        setStrength(0);
        setFeedback([]);
        return;
      }

      // Length check
      if (password.length >= 8) {
        score += 1;
      } else {
        suggestions.push('Use at least 8 characters');
      }

      // Uppercase check
      if (/[A-Z]/.test(password)) {
        score += 1;
      } else {
        suggestions.push('Add uppercase letters');
      }

      // Lowercase check
      if (/[a-z]/.test(password)) {
        score += 1;
      } else {
        suggestions.push('Add lowercase letters');
      }

      // Number check
      if (/\d/.test(password)) {
        score += 1;
      } else {
        suggestions.push('Add numbers');
      }

      // Special character check
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score += 1;
      } else {
        suggestions.push('Add special characters (!@#$%)');
      }

      setStrength(score);
      setFeedback(suggestions);
      onStrengthChange?.(score);
    };

    calculateStrength();
  }, [password, onStrengthChange]);

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-gray-200';
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthTextColor = () => {
    if (strength === 0) return 'text-gray-500';
    if (strength <= 2) return 'text-red-500';
    if (strength <= 3) return 'text-yellow-600';
    if (strength <= 4) return 'text-blue-500';
    return 'text-green-500';
  };

  if (password.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ease-out ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium transition-colors duration-200 ${getStrengthTextColor()}`}>
          {getStrengthText()}
        </span>
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="text-xs text-gray-600 space-y-1">
          {feedback.map((suggestion, index) => (
            <div key={index} className="flex items-center space-x-1 animate-in slide-in-from-left duration-200">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}