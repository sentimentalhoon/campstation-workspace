/**
 * Step Indicator 컴포넌트
 *
 * 다단계 프로세스의 현재 진행 상황을 시각적으로 표시
 * - 현재 단계 하이라이트
 * - 완료된 단계 체크 표시
 * - 단계별 레이블
 */

type Step = {
  label: string;
  description?: string;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: number; // 1-based index
  className?: string;
};

export default function StepIndicator({
  steps,
  currentStep,
  className = "",
}: StepIndicatorProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex flex-1 items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-colors ${
                    isCompleted
                      ? "border-primary bg-primary text-white"
                      : isActive
                        ? "border-primary text-primary bg-white"
                        : "border-neutral-300 bg-white text-neutral-400"
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-lg">✓</span>
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div
                    className={`text-xs font-medium ${
                      isActive || isCompleted
                        ? "text-neutral-900"
                        : "text-neutral-400"
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="mt-0.5 text-xs text-neutral-500">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    stepNumber < currentStep ? "bg-primary" : "bg-neutral-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
