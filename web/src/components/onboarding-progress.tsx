'use client';

import { Check } from 'lucide-react';

interface OnboardingProgressProps {
    currentStep: number;
}

export default function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
    const getStepTitle = (step: number) => {
        const titles = {
            1: 'Drug Allergies',
            2: 'Medical Conditions',
            3: 'Current Medications',
            4: 'Dietary Restrictions'
        };
        return titles[step as keyof typeof titles] || 'Health Profile';
    };

    return (
        <div className="px-6 my-6">
            <div>
                {/* Step Info Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 rounded-full h-8 w-8 flex items-center justify-center">
                            <span className="text-emerald-700 font-bold text-sm">{currentStep}</span>
                        </div>
                        <div>
                            <h2 className="text-gray-900 font-bold text-base">{getStepTitle(currentStep)}</h2>
                            <p className="text-gray-500 text-sm">Step {currentStep} of 4</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-emerald-600 text-lg font-bold">{currentStep * 25}%</p>
                        <p className="text-gray-400 text-xs">Complete</p>
                    </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="relative">
                    <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-emerald-500 rounded-full h-3 transition-all duration-500 ease-out"
                            style={{ width: `${currentStep * 25}%` }}
                        />
                    </div>

                    {/* Progress Steps Indicators */}
                    <div className="flex justify-between absolute -top-1 -bottom-1 left-0 right-0">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`w-5 h-5 rounded-full border-1 transition-all duration-300 flex items-center justify-center ${currentStep >= step
                                    ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/50'
                                    : 'bg-white border-gray-300'
                                    }`}
                            >
                                {currentStep >= step && (
                                    <Check className="w-3 h-3 text-white" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Labels */}
                <div className="flex justify-between mt-6">
                    {['Personal', 'Medical', 'Medications', 'Dietary'].map((label, index) => (
                        <span
                            key={index}
                            className={`text-xs font-medium transition-colors duration-300 ${currentStep > index + 1
                                ? 'text-emerald-600'
                                : currentStep === index + 1
                                    ? 'text-emerald-700'
                                    : 'text-gray-400'
                                }`}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}