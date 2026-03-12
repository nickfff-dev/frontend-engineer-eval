'use client'
import React from 'react'
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { AppSidebar } from "@/components/custom-sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [queryClient] = React.useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <div className="flex min-h-screen flex-col bg-slate-50">
                <div className="flex flex-1 overflow-hidden">
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset>
                            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                                <div className="flex items-center gap-2 px-4">
                                    <SidebarTrigger className="-ml-1" />
                                    <Separator
                                        orientation="vertical"
                                        className="mr-2 data-[orientation=vertical]:h-4"
                                    />
                                </div>
                            </header>
                            <main className="flex-1 overflow-auto">
                                <div className="p-4 sm:p-6">{children}</div>
                            </main>
                        </SidebarInset>
                    </SidebarProvider>
                </div>
            </div>
        </QueryClientProvider>
    )
}
