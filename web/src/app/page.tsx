'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiClock, FiShield, FiChevronDown, FiStar, FiMenu, FiX } from 'react-icons/fi';
import { MdOutlineQrCodeScanner, MdOutlineVerifiedUser } from 'react-icons/md';
import { RiMedicineBottleLine, RiAlarmWarningLine } from 'react-icons/ri';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FiDownload } from "react-icons/fi";

// Define section colors
const sectionColors = {
    hero: { bg: 'bg-white', text: 'text-gray-800', hover: 'hover:text-primary', underline: 'bg-primary' },
    features: { bg: 'bg-white/95', text: 'text-gray-800', hover: 'hover:text-primary', underline: 'bg-primary' },
    'feature-ocr': { bg: 'bg-purple-50', text: 'text-purple-900', hover: 'hover:text-purple-700', underline: 'bg-purple-700' },
    'feature-dosage': { bg: 'bg-white', text: 'text-foreground', hover: 'hover:text-primary', underline: 'bg-primary' },
    'feature-verification': { bg: 'bg-green-50', text: 'text-green-900', hover: 'hover:text-green-700', underline: 'bg-green-700' },
    'feature-reminders': { bg: 'bg-white', text: 'text-foreground', hover: 'hover:text-primary', underline: 'bg-primary' },
    'feature-alerts': { bg: 'bg-red-50', text: 'text-red-900', hover: 'hover:text-red-700', underline: 'bg-red-700' },
    testimonials: { bg: 'bg-white', text: 'text-foreground', hover: 'hover:text-primary', underline: 'bg-primary' },
    faq: { bg: 'bg-white', text: 'text-foreground', hover: 'hover:text-primary', underline: 'bg-primary' },
    cta: { bg: 'bg-gradient-to-r from-primary to-secondary', text: 'text-white', hover: 'hover:text-white/80', underline: 'bg-white' }
};

const Navbar = () => {
    const [currentSection, setCurrentSection] = useState('hero');
    const [showShadow, setShowShadow] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            const sections = [
                'hero', 'features', 'feature-ocr', 'feature-verification',
                'feature-dosage', 'feature-alerts', 'feature-reminders',
                'testimonials', 'faq', 'cta'
            ];

            const scrollPosition = window.scrollY + 100;

            // Determine current section
            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setCurrentSection(sectionId);
                        break;
                    }
                }
            }

            // Show shadow while scrolling
            setShowShadow(true);

            // Clear existing timeout
            clearTimeout(scrollTimeout);

            // Hide shadow after scrolling stops
            scrollTimeout = setTimeout(() => {
                setShowShadow(false);
            }, 150);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        setIsMobileMenuOpen(false);
    };

    const navLinks = [
        { name: 'Features', id: 'features' },
        { name: 'How It Works', id: 'how-it-works' },
        { name: 'Testimonials', id: 'testimonials' },
        { name: 'FAQ', id: 'faq' }
    ];

    const currentColors = sectionColors[currentSection as keyof typeof sectionColors] || sectionColors.hero;
    const isDarkBg = currentSection === 'cta';

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${currentColors.bg
                    } ${showShadow ? 'shadow-lg' : ''
                    } backdrop-blur-md`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <motion.div
                            className="flex items-center cursor-pointer"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="inline-flex items-center justify-center">
                                <img src="/logo-transparent.png" alt="RxScan Logo" className='h-14' />
                                <span className={`text-primary text-3xl font-body font-semibold ml-2 ${isDarkBg ? 'text-white' : ''
                                    }`}>RxScan</span>
                            </div>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link, index) => (
                                <motion.button
                                    key={link.id}
                                    onClick={() => scrollToSection(link.id)}
                                    className={`text-base font-medium transition-colors relative group ${currentColors.text
                                        } ${currentColors.hover}`}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -2 }}
                                >
                                    {link.name}
                                    <motion.span
                                        className={`absolute -bottom-1 left-0 w-0 h-0.5 ${currentColors.underline} group-hover:w-full transition-all duration-300`}
                                    />
                                </motion.button>
                            ))}
                        </div>

                        {/* Desktop CTA Buttons */}
                        <motion.div
                            className="hidden md:flex items-center space-x-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <Button
                                variant={isDarkBg ? "outline" : "ghost"}
                                className={`font-medium ${isDarkBg
                                    ? 'text-white border-white hover:bg-white/20'
                                    : `${currentColors.text} ${currentColors.hover}`
                                    }`}
                            >
                                Sign In
                            </Button>
                            <Button className={isDarkBg ? 'bg-white text-primary hover:bg-white/90' : ''}>
                                Get Started
                            </Button>
                        </motion.div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100/20 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isMobileMenuOpen ? (
                                <FiX className={`w-6 h-6 ${currentColors.text}`} />
                            ) : (
                                <FiMenu className={`w-6 h-6 ${currentColors.text}`} />
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <motion.div
                    initial={false}
                    animate={{
                        height: isMobileMenuOpen ? 'auto' : 0,
                        opacity: isMobileMenuOpen ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`md:hidden overflow-hidden ${currentColors.bg} backdrop-blur-md border-t ${isDarkBg ? 'border-white/20' : 'border-gray-200'
                        }`}
                >
                    <div className="px-4 py-4 space-y-3">
                        {navLinks.map((link) => (
                            <motion.button
                                key={link.id}
                                onClick={() => scrollToSection(link.id)}
                                className={`block w-full text-left px-4 py-3 ${currentColors.text
                                    } ${currentColors.hover} ${isDarkBg ? 'hover:bg-white/10' : 'hover:bg-gray-50'
                                    } rounded-lg font-medium transition-colors`}
                                whileTap={{ scale: 0.98 }}
                            >
                                {link.name}
                            </motion.button>
                        ))}
                        <div className="pt-4 space-y-2">
                            <Button
                                variant="outline"
                                className={`w-full font-medium ${isDarkBg
                                    ? 'text-white border-white hover:bg-white/20'
                                    : ''
                                    }`}
                            >
                                Sign In
                            </Button>
                            <Button className={`w-full ${isDarkBg ? 'bg-white text-primary hover:bg-white/90' : ''}`}>
                                Get Started
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.nav>

            {/* Spacer to prevent content from going under navbar */}
            <div className="h-20" />
        </>
    );
};

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: { icon: React.ComponentType<any>; title: string; description: string; delay?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
        >
            <Card className="h-full border-1 hover:shadow-lg transition-shadow duration-300 style-shadow-old">
                <CardContent className="p-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4">
                        <Icon className="text-white text-2xl" />
                    </div>
                    <h3 className="text-xl font-heading mb-3 text-gray-800">{title}</h3>
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const FAQItem = ({ question, answer, delay = 0 }: { question: string; answer: string; delay?: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay }}
            className="border-b border-gray-200 last:border-b-0"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left hover:text-primary transition-colors"
            >
                <span className="text-lg font-semibold text-gray-800 pr-8">{question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FiChevronDown className="text-2xl text-gray-400 flex-shrink-0" />
                </motion.div>
            </button>
            <motion.div
                initial={false}
                animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <p className="pb-6 text-gray-600 leading-relaxed">{answer}</p>
            </motion.div>
        </motion.div>
    );
};

const TestimonialCard = ({ name, role, content, rating, image }: { name: string; role: string; content: string; rating: number; image: string }) => {
    return (
        <div className="outline-1 outline-black/30 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-w-[350px] mx-4">
            <div className="flex items-center gap-1 mb-4">
                {[...Array(rating)].map((_, i) => (
                    <FiStar key={i} className="text-yellow-400 fill-yellow-400" />
                ))}
            </div>
            <p className="text-gray-700 leading-relaxed mb-6 italic">"{content}"</p>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-heading text-lg">
                    {image}
                </div>
                <div>
                    <h4 className="font-heading text-gray-800">{name}</h4>
                    <p className="text-sm text-gray-500">{role}</p>
                </div>
            </div>
        </div>
    );
};

const InfiniteTestimonials = () => {
    const testimonials = [
        {
            name: "Sarah Mitchell",
            role: "Senior Patient",
            content: "RxScan has been a lifesaver! I can finally understand my prescriptions without calling the pharmacy every time. The reminders ensure I never miss a dose.",
            rating: 5,
            image: "SM"
        },
        {
            name: "Dr. James Chen",
            role: "General Physician",
            content: "I recommend RxScan to all my patients. It reduces medication errors and helps them stay compliant with their treatment plans. Truly innovative!",
            rating: 5,
            image: "JC"
        },
        {
            name: "Priya Sharma",
            role: "Working Professional",
            content: "Managing multiple medications for my elderly parents was overwhelming. RxScan simplified everything with clear instructions and timely alerts.",
            rating: 5,
            image: "PS"
        },
        {
            name: "Michael Rodriguez",
            role: "Chronic Patient",
            content: "The drug interaction checker saved me from a potentially dangerous combination. This app is essential for anyone on multiple medications.",
            rating: 5,
            image: "MR"
        },
        {
            name: "Emily Thompson",
            role: "Nurse Practitioner",
            content: "RxScan bridges the gap between healthcare providers and patients. The AI accuracy in reading prescriptions is impressive and reliable.",
            rating: 5,
            image: "ET"
        }
    ];

    const duplicatedTestimonials = [...testimonials, ...testimonials];

    return (
        <div className="relative overflow-hidden">
            <motion.div
                className="flex py-2"
                animate={{
                    x: [0, -1900]
                }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 30,
                        ease: "linear"
                    }
                }}
            >
                {duplicatedTestimonials.map((testimonial, index) => (
                    <TestimonialCard key={index} {...testimonial} />
                ))}
            </motion.div>
        </div>
    );
};

export default function RxScanLanding() {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <motion.section
                id="hero"
                style={{ opacity, scale }}
                className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden mt-[-50px]"
            >
                <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Device Mockup */}
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative hidden lg:block"
                    >
                        <div
                            className="relative flex items-center justify-center"
                        >
                            <img
                                src="/test.svg"
                                alt="RxScan devices"
                                className="relative w-full mt-[50px] xl:ml-[-50px]"
                            />
                        </div>
                    </motion.div>

                    {/* Right side - Content */}
                    <div className="text-center lg:text-left">
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="font-heading text-6xl md:text-7xl font-bold tracking-wide text-secondary text-outline-shadow"
                        >
                            Scan
                        </motion.h1>
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="font-heading text-6xl md:text-7xl font-bold mt-[-5px] tracking-wide text-secondary text-outline-shadow"
                        >
                            Understand
                        </motion.h1>
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="font-heading text-6xl md:text-7xl font-bold mt-[-5px] mb-6 tracking-wide text-secondary text-outline-shadow"
                        >
                            Stay Healthy
                        </motion.h1>

                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-2xl md:text-3xl text-gray-700 mb-4 font-light text-soft-shadow"
                        >
                            Your AI-Powered Prescription Assistant
                        </motion.p>

                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto lg:mx-0 font-extralight text-soft-shadow"
                        >
                            Decode handwritten prescriptions instantly. Verify medications accurately.
                            Get real-time interaction alerts. Never miss a dose again.
                        </motion.p>

                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <Button size="lg">
                                Get Started Free
                            </Button>
                            <Button size="lg" variant="outline">
                                Download Mobile App
                                <FiDownload size={20} />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Problem Statement */}
            <AnimatedSection>
                <section id="features" className="py-20 px-4 bg-white/50 backdrop-blur-sm scroll-mt-20">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl mb-6 text-gray-800 font-heading">
                                The Problem with Prescriptions
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Handwritten prescriptions are often illegible, leading to medication errors,
                                confusion, and potential health risks.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={FiAlertTriangle}
                                title="Hard to Read"
                                description="Doctors' handwriting can be nearly impossible to decipher, causing confusion at pharmacies."
                                delay={0.1}
                            />
                            <FeatureCard
                                icon={RiAlarmWarningLine}
                                title="Medication Errors"
                                description="Misinterpreted prescriptions lead to wrong medications or incorrect dosages."
                                delay={0.2}
                            />
                            <FeatureCard
                                icon={FiClock}
                                title="Missed Doses"
                                description="Without proper tracking, patients often forget their medication schedule."
                                delay={0.3}
                            />
                        </div>
                    </div>
                </section>
            </AnimatedSection>

            {/* Feature 1: OCR + NLP */}
            <AnimatedSection>
                <section id="feature-ocr" className="py-35 px-4 bg-purple-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-6">
                                    <MdOutlineQrCodeScanner className="text-purple-600 mr-2" />
                                    <span className="text-purple-600 font-semibold">Smart Scanning</span>
                                </div>
                                <h2 className="text-4xl font-heading mb-6 text-gray-800">
                                    Prescription Parsing with AI
                                </h2>
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    Our advanced OCR technology combined with medical NLP accurately extracts medicine names,
                                    dosage instructions, frequency, and duration from even the most challenging handwriting.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Reads handwritten and digital prescriptions</span>
                                    </li>
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Understands medical abbreviations like BD, TDS, SOS</span>
                                    </li>
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Extracts complete medication details in seconds</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="relative">
                                <img
                                    src="/landing-page/1.png"
                                    alt="Prescription scanning"
                                    className="relative w-full"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </AnimatedSection>

            {/* Feature 2: Dosage Assistance */}
            <AnimatedSection>
                <section id="feature-dosage" className="py-40 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center px-4 py-2 bg-primary/15 rounded-full mb-6">
                                    <RiMedicineBottleLine className="text-primary mr-2" />
                                    <span className="text-primary font-semibold">Smart Guidance</span>
                                </div>
                                <h2 className="text-4xl font-heading mb-6 text-gray-800">
                                    Dosage & Usage Guidelines
                                </h2>
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    Get clear, easy-to-understand instructions for each medication including standard
                                    dosage ranges, timing, and whether to take before or after meals.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Standard dosage ranges for safe usage</span>
                                    </li>
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Detailed usage instructions and timing</span>
                                    </li>
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Warnings for abnormal dosage levels</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-green-200 to-blue-200 rounded-3xl blur-2xl opacity-30" />
                                <img
                                    src="/landing-page/2.png"
                                    alt="Dosage guidelines"
                                    className="relative w-full"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </AnimatedSection>

            {/* Feature 3: Medicine Verification */}
            <AnimatedSection>
                <section id="feature-verification" className="py-30 px-4 bg-green-50">
                    <div className="max-w-6xl mx-auto">
                        <div id="how-it-works" className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-green-200 to-blue-200 rounded-3xl blur-2xl opacity-30" />
                                <img
                                    src="/landing-page/3.png"
                                    alt="Medicine verification"
                                    className="relative w-full"
                                />
                            </div>
                            <div className="order-1 md:order-2">
                                <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full mb-6">
                                    <MdOutlineVerifiedUser className="text-green-600 mr-2" />
                                    <span className="text-green-600 font-semibold">Verified & Safe</span>
                                </div>
                                <h2 className="text-4xl font-heading mb-6 text-gray-800">
                                    Real-Time Medicine Verification
                                </h2>
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    Cross-reference every medication against comprehensive drug databases to ensure accuracy,
                                    availability, and provide generic alternatives when available.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Confirms drug spelling and formulation</span>
                                    </li>
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Suggests cost-effective generic alternatives</span>
                                    </li>
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Alerts on unusual dosage recommendations</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </AnimatedSection>

            {/* Feature 4: Reminders & Tracking */}
            <AnimatedSection>
                <section id="feature-reminders" className="py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center px-4 py-2 bg-primary/15 rounded-full mb-6">
                                    <IoMdNotificationsOutline className="text-primary mr-2 text-xl" />
                                    <span className="text-primary font-semibold">Never Miss a Dose</span>
                                </div>
                                <h2 className="text-4xl font-heading mb-6 text-gray-800">
                                    Smart Reminders & Tracking
                                </h2>
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    Set intelligent medication reminders based on your prescription schedule.
                                    Track adherence and get notified about missed doses to stay on top of your health.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Customized reminders for each medication</span>
                                    </li>
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Adherence tracking and progress insights</span>
                                    </li>
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Before/after meal timing notifications</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-3xl blur-2xl opacity-30" />
                                <img
                                    src="/landing-page/3.png"
                                    alt="Medication reminders"
                                    className="relative w-full"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </AnimatedSection>


            {/* Feature 5: Interaction Alerts */}
            <AnimatedSection>
                <section id="feature-alerts" className="py-20 px-4 bg-gradient-to-br from-red-50 to-orange-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-red-200 to-orange-200 rounded-3xl blur-2xl opacity-30" />
                                <img
                                    src="/landing-page/4.png"
                                    alt="Interaction alerts"
                                    className="relative w-full"
                                />
                            </div>
                            <div className="order-1 md:order-2">
                                <div className="inline-flex items-center px-4 py-2 bg-red-100 rounded-full mb-6">
                                    <FiShield className="text-red-600 mr-2" />
                                    <span className="text-red-600 font-semibold">Safety First</span>
                                </div>
                                <h2 className="text-4xl font-heading mb-6 text-gray-800">
                                    Interaction Alerts & Safety
                                </h2>
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    Stay safe with real-time alerts about potential food-drug and drug-drug interactions.
                                    Know what to avoid and when to consult your doctor.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Food-medicine interaction warnings</span>
                                    </li>
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Drug-drug conflict detection</span>
                                    </li>
                                    <li className="flex items-start">
                                        <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Lifestyle and dietary recommendations</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </AnimatedSection>



            {/* Testimonials Section */}
            <AnimatedSection>
                <section id="testimonials" className="py-25 px-4">
                    <div className="max-w-6xl mx-auto mb-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-heading mb-6 text-gray-800">
                            Loved by Thousands of Users
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Join our community of satisfied users who have transformed their healthcare experience with RxScan.
                        </p>
                    </div>
                    <InfiniteTestimonials />
                </section>
            </AnimatedSection>

            {/* FAQ Section */}
            <AnimatedSection>
                <section id="faq" className="py-20 px-4 scroll-mt-20">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-heading mb-6 text-gray-800">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-xl text-gray-600">
                                Everything you need to know about RxScan
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl outline-1 outline-black/30 p-8 border border-gray-100">
                            <FAQItem
                                question="How accurate is the prescription scanning?"
                                answer="RxScan uses advanced AI-powered OCR and medical NLP technology to achieve over 95% accuracy in reading handwritten prescriptions. Our system is trained on millions of prescriptions and continuously improves with usage."
                                delay={0.1}
                            />
                            <FAQItem
                                question="Is my medical data secure and private?"
                                answer="Absolutely. We use bank-level encryption and comply with HIPAA regulations. Your prescription data is stored securely and never shared with third parties. You have complete control over your information."
                                delay={0.2}
                            />
                            <FAQItem
                                question="Can RxScan detect drug interactions?"
                                answer="Yes! RxScan checks for potential drug-drug and food-drug interactions in real-time. When you add multiple medications, our system automatically analyzes them and alerts you to any potential conflicts or interactions that require medical attention."
                                delay={0.3}
                            />
                            <FAQItem
                                question="Do I need an internet connection to use RxScan?"
                                answer="While RxScan works best with an internet connection for real-time verification and updates, basic scanning and reminder features work offline. Your scanned prescriptions are stored locally and sync when you're back online."
                                delay={0.4}
                            />
                            <FAQItem
                                question="Is RxScan available on both iOS and Android?"
                                answer="Yes! RxScan is available on both iOS and Android platforms. You can download it from the App Store or Google Play Store. We also offer a web version for desktop access."
                                delay={0.5}
                            />
                            <FAQItem
                                question="How much does RxScan cost?"
                                answer="RxScan offers a free tier with basic scanning and reminder features. Our Premium plan starts at $9.99/month and includes unlimited scans, advanced drug interaction checking, family sharing, and priority support. We also offer annual plans with discounts."
                                delay={0.6}
                            />
                        </div>
                    </div>
                </section>
            </AnimatedSection>


            {/* Call to Action Section */}
            <motion.section
                id="cta"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="py-20 px-4 bg-gradient-to-r from-primary to-secondary text-white text-center"
            >
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-heading mb-6">
                        Ready to Simplify Your Medication Management?
                    </h2>
                    <p className="text-xl mb-8 max-w-3xl mx-auto">
                        Download RxScan today and take control of your prescriptions with AI-powered accuracy and convenience.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center text-foreground">
                        <Button size="lg" variant={'outline'}>
                            Get Started Free
                        </Button>
                        <Button size="lg" variant="outline">
                            Contact Sales
                        </Button>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}