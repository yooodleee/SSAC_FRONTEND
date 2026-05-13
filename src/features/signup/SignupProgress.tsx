import { cn } from '@/lib/utils';

// UI-only type: not derived from API contract
type SignupStep = 'terms' | 'nickname' | 'type';

interface SignupProgressProps {
  currentStep: SignupStep;
}

const STEPS = [
  { id: 'social', label: '소셜 로그인' },
  { id: 'terms', label: '약관 동의' },
  { id: 'nickname', label: '닉네임 설정' },
  { id: 'type', label: '유형 선택' },
] as const;

const stepOrder: SignupStep[] = ['terms', 'nickname', 'type'];

function getStepState(
  stepId: (typeof STEPS)[number]['id'],
  currentStep: SignupStep,
): 'done' | 'active' | 'pending' {
  if (stepId === 'social') return 'done';
  const currentIndex = stepOrder.indexOf(currentStep);
  const stepIndex = stepOrder.indexOf(stepId as SignupStep);
  if (stepIndex < currentIndex) return 'done';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

export function SignupProgress({ currentStep }: SignupProgressProps) {
  return (
    <nav aria-label="회원가입 진행 단계" className="flex items-center justify-center gap-0 py-6">
      {STEPS.map((step, index) => {
        const state = getStepState(step.id, currentStep);
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  state === 'done' && 'bg-blue-600 text-white',
                  state === 'active' && 'bg-blue-600 text-white ring-4 ring-blue-100',
                  state === 'pending' && 'bg-gray-200 text-gray-500',
                )}
                aria-current={state === 'active' ? 'step' : undefined}
              >
                {state === 'done' ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  state === 'active' && 'text-blue-600',
                  state === 'done' && 'text-gray-600',
                  state === 'pending' && 'text-gray-400',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 mb-5 h-0.5 w-8 sm:w-12',
                  state === 'done' ? 'bg-blue-600' : 'bg-gray-200',
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
