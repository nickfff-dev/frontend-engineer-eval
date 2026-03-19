import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const _roboto = Roboto({ weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] },)
const _robotoMono = Roboto_Mono({ weight: ["100", "200", "300", "400", "500", "600", "700"] },)


export const metadata: Metadata = {
  title: "Micro Tasks Platform",
  description: 'Internal freelancing microtasking platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-mono", _robotoMono.className)}>
      <body
        className={`${_roboto.className} ${_robotoMono.className} antialiased`}
      >
        <AuthProvider>
          <NuqsAdapter>
            {children}
          </NuqsAdapter>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
