'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Heart, Info, Pill, ShieldCheck, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { get } from 'http';

interface OnboardingLayoutProps {
    children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        // Determine step based on pathname
        if (pathname.includes('step2')) setCurrentStep(2);
        else if (pathname.includes('step3')) setCurrentStep(3);
        else if (pathname.includes('step4')) setCurrentStep(4);
        else setCurrentStep(1);
    }, [pathname]);

    const handleNext = () => {
        if (currentStep < 4) {
            router.push(`/onboarding/step${currentStep + 1}`);
        } else {
            router.push('/dashboard');
        }   
    };

    const getStepTitle = (step: number) => {
        const titles = {
            1: 'Drug Allergies',
            2: 'Medical Conditions',
            3: 'Current Medications',
            4: 'Dietary Restrictions'
        };
        return titles[step as keyof typeof titles] || 'Health Profile';
    };

    const getStepIcon = (step: number) => {
        const icons = {
            1: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
            2: <Heart className="w-6 h-6 text-blue-600" />,
            3: <Pill className="w-6 h-6 text-emerald-600" />,
            4: <Utensils className="w-5 h-5 text-emerald-600" />,
        };
        return icons[step as keyof typeof icons] || <Info className="w-5 h-5 text-emerald-600" />;
    }

    return (
        <div className="h-dvh">
            
            {/* Enhanced Header with Gradient */}
            <div>
                {/* Main Header */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-b-[32px] overflow-hidden shadow-lg">
                    {/* Header Content */}
                    <div className="relative flex items-center justify-between px-6 py-10 pt-0">
                        <button
                            onClick={() => router.back()}
                            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 backdrop-blur-sm shadow-md"
                        >
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>

                        <div className='m-auto w-fit my-6 text-center'>
                            <h1 className='font-heading text-4xl font-medium text-white'>Create Your Health Profile</h1>
                            <p className='text-base font-gray-500 text-gray-200'>These informations will help us provide you with personalized care.</p>
                        </div>

                        <div className="w-10" />
                    </div>
                </div>

                {/* Floating Progress Card */}
                <div className="px-6 mb-6 mt-[-50px] relative z-10 bg-white rounded-2xl shadow-md py-4 mx-[150px]">
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
            </div>

            {/* Main Content */}
            <main className="pb-24 flex gap-8 px-[150px]">
                <div className="max-w-4xl mx-auto px-6 pb-32">
                    <div className="mb-4 pt-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-emerald-100 rounded-full p-3 mt-1">
                                {getStepIcon(currentStep)}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-medium text-gray-900 font-heading">{getStepTitle(currentStep)}</h2>
                                <p className="text-gray-600 text-base leading-relaxed mt-[-2px]">
                                    Help us identify potential medication-food interactions
                                </p>
                            </div>
                        </div>
                    </div>
                    {children}
                    <div className="max-w-4xl mx-auto flex gap-4 mb-4">
                        <Button
                            onClick={handleNext}
                            className='flex-1'
                            size={'lg'}
                        >
                            Continue
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={handleNext}
                            className='flex-1'
                            variant={'outline'}
                            size={'lg'}
                        >
                            Skip
                        </Button>
                    </div>

                    {/* Health Tip Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 rounded-full p-2">
                                <Info className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-blue-900 font-semibold text-sm mb-1">Quick Tip</h4>
                                <p className="text-blue-800 text-xs leading-relaxed">
                                    Accurate health information helps us provide better medication safety alerts.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-700 text-sm leading-relaxed">
                            This information helps healthcare providers make safer medication decisions for you
                        </p>
                    </div>

                    {/* Fixed Bottom Button */}
                    <div className="fixed sm:hidden bottom-0 left-0 right-0 px-6 py-6 bg-white border-t border-gray-100 shadow-lg">
                        <div className="max-w-4xl mx-auto flex gap-4">
                            <Button
                                onClick={handleNext}
                                className='flex-1'
                                size={'lg'}
                            >
                                Continue
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                            <Button
                                onClick={handleNext}
                                className='flex-1'
                                variant={'outline'}
                                size={'lg'}
                            >
                                Skip
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='w-[400px] hidden sm:block mt-[50px]'>
                    <img src={currentStep === 1 ? "/onboarding/allergy.png" : currentStep === 2 ? "/onboarding/medical-conditions.png" : currentStep === 3 ? "/onboarding/current-medications.png" : currentStep === 4 ? "/onboarding/dietary-restrictions.png" : ""} alt="" className='w-full' />
                </div>
            </main>
        </div>
    );
}