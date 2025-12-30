"use client"

import * as React from "react"
import {
    IconBed,
    IconCalendarEvent,
    IconClipboardList,
    IconDashboard,
    IconSettings,
    IconUser,
} from "@tabler/icons-react"

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "./NavMain"
import Link from "next/link"

const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Beds", url: "/dashboard/beds", icon: IconBed },
    { title: "Allocate Bed", url: "/dashboard/allocate", icon: IconCalendarEvent },
    { title: "Allocations", url: "/dashboard/allocations", icon: IconClipboardList },
    { title: "Patients", url: "/dashboard/patients", icon: IconUser },
    { title: "Simulate Data", url: "/dashboard/simulate", icon: IconSettings }
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <Link href="/dashboard">
                                <span className="text-base font-semibold">Hospital Bed Manager</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
        </Sidebar>
    )
}
