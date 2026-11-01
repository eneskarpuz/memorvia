import React, { createContext, useContext, useState } from 'react';

type Draft = {
  name: string;
  startDate: string | null;
  starter: Record<string, string>;
};

type OnboardingState = Draft & {
  update: (patch: Partial<Draft>) => void;
};

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Draft>({ name: '', startDate: null, starter: {} });
  return (
    <OnboardingContext.Provider
      value={{ ...draft, update: patch => setDraft(d => ({ ...d, ...patch })) }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext)!;
