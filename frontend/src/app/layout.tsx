import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aspire Learning Hub — Building Strong Concepts, Not Just Marks",
  description:
    "A concept-driven educational institute in Mardan, KPK. Play Group to Grade 12 with AI-powered tutoring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <AuthProvider>
          <ChatProvider>
            <Navbar />
            <main>{children}</main>
            <ConditionalFooter />
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
