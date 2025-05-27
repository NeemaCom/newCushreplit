import { useState, useCallback } from 'react';

export function useOnboarding() {
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);

  const startOnboarding = useCallback(() => {
    // Clear any previous onboarding state
    localStorage.removeItem('hasCompletedOnboarding');
    setIsOnboardingVisible(true);
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setIsOnboardingVisible(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem('hasCompletedOnboarding');
    localStorage.removeItem('hasVisitedCush');
  }, []);

  return {
    isOnboardingVisible,
    startOnboarding,
    completeOnboarding,
    resetOnboarding
  };
}