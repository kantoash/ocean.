export const dynamic = 'force-dynamic';


import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/provider/theme-provider";
import { Toaster } from "@/src/components/ui/toaster";
import AppStateProvider from "../provider/state-provider";
import { ModalProvider } from "../provider/modal-provider";
import { SupabaseUserProvider } from "../provider/use-user";
import { SocketProvider } from "../provider/socket-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ocean.",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppStateProvider>
            <SupabaseUserProvider>
              <SocketProvider>
                {children}
                <ModalProvider />
                <Toaster />
              </SocketProvider>
            </SupabaseUserProvider>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
