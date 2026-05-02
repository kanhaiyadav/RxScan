'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingNavigationProps {
    currentStep: number;
}

export default function OnboardingNavigation({ currentStep }: OnboardingNavigationProps) {
    const router = useRouter();

    const handleNext = () => {
        if (currentStep < 4) {
            router.push(`/onboarding/step${currentStep + 1}`);
        } else {
            router.push('/dashboard');
        }
    };

    const handleSkip = () => {
        // Same logic as next for now, but could be different
        handleNext();
    };

    return (
        <>
            {/* Desktop Navigation */}
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
                    onClick={handleSkip}
                    className='flex-1'
                    variant={'outline'}
                    size={'lg'}
                >
                    Skip
                </Button>
            </div>

            {/* Fixed Bottom Button - Mobile */}
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
                        onClick={handleSkip}
                        className='flex-1'
                        variant={'outline'}
                        size={'lg'}
                    >
                        Skip
                    </Button>
                </div>
            </div>
        </>
    );
}