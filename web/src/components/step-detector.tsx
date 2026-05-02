'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface StepDetectorProps {
    children: (step: number) => React.ReactNode;
}

export default function StepDetector({ children }: StepDetectorProps) {
    const pathname = usePathname();
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        // Determine step based on pathname
        if (pathname.includes('step2')) setCurrentStep(2);
        else if (pathname.includes('step3')) setCurrentStep(3);
        else if (pathname.includes('step4')) setCurrentStep(4);
        else setCurrentStep(1);
    }, [pathname]);

    return <>{children(currentStep)}</>;
}