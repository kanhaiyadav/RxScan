import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <div
                className="flex items-center cursor-pointer pt-2 pl-8"
            >
                <div className="inline-flex items-center justify-center">
                    <img src="/logo-transparent.png" alt="RxScan Logo" className='h-12' />
                    <span className={`text-primary text-2xl font-body font-semibold ml-2`}>RxScan</span>
                </div>
            </div>
            <div className="flex flex-1 min-h-0">
                <div className="hidden lg:flex lg:w-[45%] p-12 flex-col justify-center items-center text-white ml-0 mr-0 lg:ml-[50px] lg:mr-[-40px]">
                    <div className="max-w-md">
                        <div>
                            <img src="/auth/side-illustration.png" alt="" />
                        </div>
                    </div>
                </div>

                {children}
            </div>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-3">
                <div className="container mx-auto px-6">
                    <div className="flex justify-center items-center text-sm text-gray-600 space-x-6">
                        <a href="/terms" className="hover:text-gray-800 transition-colors">Terms & Conditions</a>
                        <span className="hidden sm:inline">•</span>
                        <a href="/privacy" className="hover:text-gray-800 transition-colors">Privacy Policy</a>
                        <span className="hidden sm:inline">•</span>
                        <a href="/support" className="hover:text-gray-800 transition-colors">Support</a>
                        <span className="hidden sm:inline">•</span>
                        <a href="/contact" className="hover:text-gray-800 transition-colors">Contact</a>
                        <span className="hidden sm:inline">•</span>
                        <span>&copy; 2025 RxScan. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default layout
