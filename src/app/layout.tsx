import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import Header from "@/components/Header";
import "./globals.css";
import { auth } from "@/lib/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DSA Tracker — Spaced Repetition for Algorithms",
  description:
    "Track your Data Structures & Algorithms progress with intelligent spaced repetition and quiz-based revision.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <html
      lang="en"
      className={`${inter.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <Header userId={userId} />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

/* reload */
