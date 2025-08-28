import React from "react";
import { LucideIcon } from "lucide-react";

export interface Step {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  className = "",
}) => {
  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.includes(stepIndex) || stepIndex < currentStep;
  };

  const isStepActive = (stepIndex: number) => {
    return stepIndex === currentStep;
  };

  const getStepStatus = (stepIndex: number) => {
    if (isStepCompleted(stepIndex) || isStepActive(stepIndex)) {
      return {
        circleClass: "bg-red-600",
        iconClass: "text-white",
        labelClass: "text-red-600",
        connectorClass: "bg-red-600",
      };
    }
    return {
      circleClass: "bg-gray-300",
      iconClass: "text-gray-500",
      labelClass: "text-gray-500",
      connectorClass: "bg-gray-300",
    };
  };

  return (
    <div className={`bg-white border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => {
            const { circleClass, iconClass, labelClass, connectorClass } =
              getStepStatus(index);
            const IconComponent = step.icon;

            return (
              <React.Fragment key={step.id}>
                {/* Step */}
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 ${circleClass} rounded-full flex items-center justify-center`}
                  >
                    <IconComponent className={`w-5 h-5 ${iconClass}`} />
                  </div>
                  <div className={`ml-2 text-sm font-medium ${labelClass}`}>
                    {step.label}
                  </div>
                </div>

                {/* Connector - Only show if not the last step */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      isStepCompleted(index) ? connectorClass : "bg-gray-300"
                    } max-w-24`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepProgressBar; 