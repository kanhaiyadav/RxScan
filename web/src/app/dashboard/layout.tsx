import React from 'react'
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from '@/components/AppSidebar'
import { Separator } from '@/components/ui/separator'
import { AuthGuard } from '@/components/auth-guard'

const Layout = ({children}: {children: React.ReactNode}) => {
    return (
        <AuthGuard>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className='bg-slate-100'>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">RxScan Workspace</p>
                                <p className="text-xs text-slate-500">Scan, review, store, and manage prescriptions</p>
                            </div>
                        </div>
                    </header>
                    <div className='px-4 py-6 sm:px-6 lg:px-10'>{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    )
}

export default Layout
