import React from 'react';
import { OptionList } from '../../components/OptionList';
import { useOnboarding } from '../../context/OnboardingContext';
import { STARTER_QUESTIONS } from '../../data/questions';
import { OnboardingLayout } from './OnboardingLayout';

export default function QuizScreen({ navigation, route }: any) {
  const index: number = route.params?.index ?? 0;
  const q = STARTER_QUESTIONS[index];
  const { starter, update } = useOnboarding();
  const isLast = index === STARTER_QUESTIONS.length - 1;

  const next = () =>
    isLast
      ? navigation.navigate('Pair', { mode: 'onboarding' })
      : navigation.push('OnbQuiz', { index: index + 1 });

  return (
    <OnboardingLayout
      step={2 + index}
      label={q.label}
      title={q.title}
      ctaDisabled={!starter[q.id]}
      onBack={() => navigation.goBack()}
      onSkip={next}
      onNext={next}
    >
      <OptionList
        options={q.options}
        value={starter[q.id]}
        onSelect={v => update({ starter: { ...starter, [q.id]: v } })}
      />
    </OnboardingLayout>
  );
}
