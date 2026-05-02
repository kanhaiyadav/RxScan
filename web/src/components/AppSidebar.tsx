"use client"

import * as React from "react"
import {
    LucideScanText,
    LayoutDashboard,
    FileText,
    Bell,
    UserRound,
    HelpCircle,
    Settings2,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

const data = {
    user: {
        name: "RxScan user",
        email: "secure workspace",
        avatar: "/logo-transparent.png",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Scan Prescription",
            url: "/dashboard/scan",
            icon: LucideScanText,
        },
        {
            title: "Prescriptions",
            url: "/dashboard/prescriptions",
            icon: FileText,
        },
        {
            title: "Reminders",
            url: "/dashboard/reminders",
            icon: Bell,
        },
        {
            title: "Health Profile",
            url: "/dashboard/profile",
            icon: UserRound,
        },
        {
            title: "Settings",
            url: "/dashboard/settings",
            icon: Settings2,
        },
        {
            title: "Help",
            url: "/dashboard/help",
            icon: HelpCircle,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props} className="bg-gradient-to-br from-secondary to-primary">
            <SidebarHeader>
                <div
                    className="flex items-center cursor-pointer bg-white p-2 py-1 rounded-lg border border-black/30 shadow-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <div className="inline-flex items-center justify-center">
                        <img src="/logo-transparent.png" alt="RxScan Logo" className='h-11' />
                        <span className={`text-primary text-2xl font-body font-semibold ml-2`}>RxScan</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
