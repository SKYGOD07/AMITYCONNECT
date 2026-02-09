import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/theme-provider";
import FloatingChat from "@/components/chat/FloatingChat";
import EmergencyAlertOverlay from "@/components/sos/EmergencyAlertOverlay";
import { Toaster } from "@/components/ui/sonner";
import UnverifiedFacultyBanner from "@/components/layout/UnverifiedFacultyBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AmityConnect",
  description: "Campus commute and assistance platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen bg-background flex flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-8">
                {children}
              </main>
              <FloatingChat />
              <EmergencyAlertOverlay />
              <UnverifiedFacultyBanner />
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
