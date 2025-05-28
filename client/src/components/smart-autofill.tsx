import { useState, useEffect } from 'react';

interface AutofillSuggestion {
  value: string;
  confidence: number;
}

interface SmartAutofillProps {
  field: string;
  value: string;
  onSuggestionSelect: (value: string) => void;
  placeholder?: string;
}

export default function SmartAutofill({ field, value, onSuggestionSelect, placeholder }: SmartAutofillProps) {
  const [suggestions, setSuggestions] = useState<AutofillSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Get suggestions based on field type and user input
    const generateSuggestions = () => {
      const stored = localStorage.getItem(`cush_autofill_${field}`) || '[]';
      const previousInputs = JSON.parse(stored) as string[];
      
      const filtered = previousInputs
        .filter(input => input.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 3)
        .map(input => ({
          value: input,
          confidence: input.toLowerCase().startsWith(value.toLowerCase()) ? 0.9 : 0.6
        }));

      // Add smart suggestions based on field type
      if (field === 'email' && value.includes('@')) {
        const domain = value.split('@')[1] || '';
        const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        const domainSuggestions = commonDomains
          .filter(d => d.startsWith(domain))
          .map(d => ({
            value: value.split('@')[0] + '@' + d,
            confidence: 0.8
          }));
        filtered.push(...domainSuggestions);
      }

      setSuggestions(filtered.slice(0, 3));
      setShowSuggestions(filtered.length > 0);
    };

    const timeoutId = setTimeout(generateSuggestions, 150);
    return () => clearTimeout(timeoutId);
  }, [value, field]);

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
    
    // Store successful selection
    const stored = localStorage.getItem(`cush_autofill_${field}`) || '[]';
    const previousInputs = JSON.parse(stored) as string[];
    const updated = [suggestion, ...previousInputs.filter(input => input !== suggestion)].slice(0, 10);
    localStorage.setItem(`cush_autofill_${field}`, JSON.stringify(updated));
  };

  if (!showSuggestions) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleSuggestionClick(suggestion.value)}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between"
        >
          <span className="truncate">{suggestion.value}</span>
          <span className="ml-2 text-xs text-gray-400">
            {Math.round(suggestion.confidence * 100)}%
          </span>
        </button>
      ))}
    </div>
  );
}